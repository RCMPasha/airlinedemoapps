from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, seed, policies
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Meridian Airways API",
    description="API for Meridian Airways Reservation and Operations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    seed.seed_db(db)
    db.close()

@app.get("/api/flights", response_model=List[schemas.Flight])
def get_flights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Flight).offset(skip).limit(limit).all()

@app.get("/api/airports", response_model=List[schemas.Airport])
def get_airports(db: Session = Depends(get_db)):
    return db.query(models.Airport).all()

@app.get("/api/customers", response_model=List[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()

@app.get("/api/bookings", response_model=List[schemas.Booking])
def get_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).all()

@app.post("/api/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    import random
    pnr = f"PNR{random.randint(1000, 9999)}"
    
    flight = db.query(models.Flight).filter(models.Flight.id == booking.flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
        
    db_booking = models.Booking(
        pnr=pnr,
        customer_id=booking.customer_id,
        flight_id=booking.flight_id,
        cabin_class=booking.cabin_class,
        total_amount=flight.base_price * (2.0 if booking.cabin_class in ["Business Class", "First Class"] else 1.0) * booking.passengers
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    db.refresh(db_booking)
    return db_booking

@app.get("/api/bookings/{pnr}", response_model=schemas.Booking)
def get_booking_by_pnr(pnr: str, last_name: str = None, email: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Booking).join(models.Customer).filter(models.Booking.pnr == pnr.upper())
    if last_name:
        query = query.filter(models.Customer.last_name.ilike(last_name))
    if email:
        query = query.filter(models.Customer.email.ilike(email))
        
    booking = query.first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found. Please check PNR and Name/Email.")
    return booking

@app.post("/api/bookings/{pnr}/cancel")
def cancel_booking(pnr: str, reason: str = "Customer initiated cancellation", db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.pnr == pnr.upper()).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.status != "Confirmed":
        raise HTTPException(status_code=400, detail="Only Confirmed bookings can be cancelled")
        
    booking.status = "Refund Requested"
    
    # Calculate initial refund rules based on cabin class (simplified AI-agent simulation)
    refund_amount = booking.total_amount
    human_approval = False
    ai_recommendation = "Full refund approved per policy."
    conf_score = 95.0
    
    if booking.cabin_class == "Economy Saver":
        refund_amount = 0
        ai_recommendation = "Economy Saver is non-refundable."
        conf_score = 99.0
    elif booking.cabin_class == "Economy Flex":
        refund_amount = booking.total_amount - 50.0
        ai_recommendation = "Refunded with $50 cancellation fee."
        conf_score = 90.0
    elif booking.cabin_class == "Business Class" and booking.total_amount > 2500:
        human_approval = True
        ai_recommendation = "High value refund requires supervisor approval."
        conf_score = 65.0
        
    refund = models.RefundRequest(
        booking_id=booking.id,
        reason=reason,
        status="Pending" if not human_approval else "Manual Review",
        refund_amount=refund_amount,
        ai_recommendation=ai_recommendation,
        confidence_score=conf_score,
        human_approval_required=human_approval
    )
    db.add(refund)
    
    # Audit log
    db.add(models.AuditLog(
        agent_name="Booking Agent",
        action="Booking Cancellation",
        decision="Refund Requested",
        inputs=f"PNR: {pnr}, Reason: {reason}",
        outputs=f"Amount: ${refund_amount}",
        booking_id=booking.id
    ))
    
    db.commit()
    return {"message": "Booking cancelled and refund requested successfully."}

@app.get("/api/refunds", response_model=List[schemas.RefundRequest])
def get_refund_requests(db: Session = Depends(get_db)):
    return db.query(models.RefundRequest).all()

# New endpoint: return the policy definitions
@app.get("/api/policies", response_model=List[schemas.Policy])
def get_policies():
    return [schemas.Policy(name=name, description=desc) for name, desc in policies.POLICIES.items()]

@app.post("/api/refunds/{refund_id}/approve")
def approve_refund(refund_id: int, comments: str = "", db: Session = Depends(get_db)):
    refund = db.query(models.RefundRequest).filter(models.RefundRequest.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund request not found")
    refund.status = "Approved"
    refund.supervisor_comments = comments
    
    # Audit log
    db.add(models.AuditLog(
        agent_name="Supervisor",
        action="Manual Approval",
        decision="Approved",
        inputs=f"Refund ID: {refund_id}",
        outputs=f"Comments: {comments}",
        booking_id=refund.booking_id
    ))
    db.commit()
    return {"message": "Approved"}

@app.post("/api/refunds/{refund_id}/reject")
def reject_refund(refund_id: int, comments: str, db: Session = Depends(get_db)):
    refund = db.query(models.RefundRequest).filter(models.RefundRequest.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund request not found")
    refund.status = "Rejected"
    refund.supervisor_comments = comments
    
    # Audit log
    db.add(models.AuditLog(
        agent_name="Supervisor",
        action="Manual Rejection",
        decision="Rejected",
        inputs=f"Refund ID: {refund_id}",
        outputs=f"Comments: {comments}",
        booking_id=refund.booking_id
    ))
    db.commit()
    return {"message": "Rejected"}

@app.get("/api/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
