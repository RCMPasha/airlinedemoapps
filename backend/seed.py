import datetime
import random
from sqlalchemy.orm import Session
import json
import os
import models, schemas
from database import engine, Base

def seed_db(db: Session, force: bool = False):
    # Check if we already have data - use bookings as the reliable indicator
    if not force and db.query(models.Booking).count() > 0:
        return

    
    # 1. Airports
    seed_path = os.path.join(os.path.dirname(__file__), 'airports_seed.json')
    if os.path.exists(seed_path):
        with open(seed_path, 'r', encoding='utf-8') as f:
            airports_data = json.load(f)
    else:
        airports_data = [
            {"code": "DXB", "name": "Dubai International Airport", "city": "Dubai", "country": "UAE"},
            {"code": "LHR", "name": "Heathrow Airport", "city": "London", "country": "UK"}
        ]
        
    for ad in airports_data:
        db.add(models.Airport(**ad))
    db.commit()

    # 2. Customers
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
    last_names = ["Doe", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"]
    tiers = ["Blue", "Silver", "Gold", "Platinum"]
    customers = []
    for i in range(100):
        c = models.Customer(
            first_name=random.choice(first_names),
            last_name=random.choice(last_names),
            email=f"customer{i}@example.com",
            loyalty_tier=random.choice(tiers)
        )
        db.add(c)
        customers.append(c)
    db.commit()

    # 3. Flights
    aircraft_types = ["Airbus A320", "Airbus A350", "Boeing 737", "Boeing 787", "Boeing 777"]
    statuses = ["Scheduled", "Delayed", "Cancelled", "Boarding", "In Air", "Landed"]
    codes = [a["code"] for a in airports_data]
    flights = []
    now = datetime.datetime.utcnow()
    for i in range(200):
        origin = random.choice(codes)
        dest = random.choice([c for c in codes if c != origin])
        dep_time = now + datetime.timedelta(days=random.randint(-5, 15), hours=random.randint(0, 23))
        duration = datetime.timedelta(hours=random.randint(2, 14))
        f = models.Flight(
            flight_number=f"AV{random.randint(100, 9999)}",
            origin=origin,
            destination=dest,
            departure_time=dep_time,
            arrival_time=dep_time + duration,
            aircraft_type=random.choice(aircraft_types),
            status=random.choices(statuses, weights=[70, 10, 5, 5, 5, 5])[0],
            base_price=random.randint(150, 1500)
        )
        db.add(f)
        flights.append(f)
    
    # 3.5 Guaranteed Popular Routes for Demo purposes
    popular_routes = [
        ("DXB", "LHR"), ("LHR", "JFK"), ("SIN", "SYD"), 
        ("NRT", "DXB"), ("CDG", "FRA")
    ]
    base_date = now + datetime.timedelta(days=6) # ~ 2026-06-10 if now is 06-04
    for orig, dest in popular_routes:
        # Create a few flights over the next 14 days for each popular route
        for d_offset in [0, 2, 5, 8, 12]:
            dep_time = base_date + datetime.timedelta(days=d_offset, hours=random.randint(6, 18))
            duration = datetime.timedelta(hours=random.randint(2, 14))
            f = models.Flight(
                flight_number=f"AV{random.randint(100, 9999)}",
                origin=orig,
                destination=dest,
                departure_time=dep_time,
                arrival_time=dep_time + duration,
                aircraft_type=random.choice(aircraft_types),
                status="Scheduled",
                base_price=random.randint(250, 800)
            )
            db.add(f)
            flights.append(f)
            
    db.commit()

    # 4. Bookings & Specific Demo Scenarios
    # We need 5 specific demo scenarios as requested.
    cabin_classes = ["Economy Saver", "Economy Flex", "Business Class", "First Class"]
    
    # Scenario 1: Economy Flex, Auto Refund (No Human Approval)
    b1 = models.Booking(pnr="PNR001", customer_id=1, flight_id=1, cabin_class="Economy Flex", status="Refund Requested", total_amount=400.0)
    db.add(b1)
    db.commit()
    rr1 = models.RefundRequest(
        booking_id=b1.id, reason="Plans changed", status="Approved", refund_amount=350.0,
        ai_recommendation="Approve (Deduct $50 fee). Policy: Economy Flex",
        confidence_score=98.5, human_approval_required=False
    )
    db.add(rr1)

    # Scenario 2: Business Class, Amount $3200 (Human Approval Required)
    b2 = models.Booking(pnr="PNR002", customer_id=2, flight_id=2, cabin_class="Business Class", status="Refund Requested", total_amount=3200.0)
    db.add(b2)
    db.commit()
    rr2 = models.RefundRequest(
        booking_id=b2.id, reason="Business meeting cancelled", status="Pending", refund_amount=3200.0,
        ai_recommendation="Approve (Fully Refundable). Policy: Business Class",
        confidence_score=95.0, human_approval_required=True
    )
    db.add(rr2)

    # Scenario 3: Flight Cancelled by Airline (Immediate Approval)
    # Make flight cancelled
    f3 = db.query(models.Flight).filter(models.Flight.id == 3).first()
    f3.status = "Cancelled"
    b3 = models.Booking(pnr="PNR003", customer_id=3, flight_id=3, cabin_class="Economy Saver", status="Refund Requested", total_amount=250.0)
    db.add(b3)
    db.commit()
    rr3 = models.RefundRequest(
        booking_id=b3.id, reason="Flight Cancelled", status="Approved", refund_amount=250.0,
        ai_recommendation="Auto Approve. Reason: Flight Cancelled by Airline",
        confidence_score=100.0, human_approval_required=False
    )
    db.add(rr3)

    # Scenario 4: Fraud Risk Score 85 (Manual Review)
    b4 = models.Booking(pnr="PNR004", customer_id=4, flight_id=4, cabin_class="Economy Flex", status="Refund Requested", total_amount=600.0)
    db.add(b4)
    db.commit()
    rr4 = models.RefundRequest(
        booking_id=b4.id, reason="Not traveling", status="Pending", refund_amount=550.0,
        ai_recommendation="Manual Review. Fraud Score 85",
        confidence_score=40.0, human_approval_required=True
    )
    db.add(rr4)

    # Scenario 5: Medical Emergency (AI Recommends Approval, Human Approval Required)
    b5 = models.Booking(pnr="PNR005", customer_id=5, flight_id=5, cabin_class="Economy Saver", status="Refund Requested", total_amount=200.0)
    db.add(b5)
    db.commit()
    rr5 = models.RefundRequest(
        booking_id=b5.id, reason="Medical Emergency Document Attached", status="Pending", refund_amount=200.0,
        ai_recommendation="Approve (Exception: Medical Emergency)",
        confidence_score=90.0, human_approval_required=True
    )
    db.add(rr5)

    db.commit()
    
    # Audit Logs for these
    db.add(models.AuditLog(agent_name="Eligibility Agent", action="Evaluated Economy Flex Policy", decision="Eligible for refund minus $50 fee", inputs="PNR001, Policy=Economy Flex", outputs="Refund $350", booking_id=b1.id))
    db.add(models.AuditLog(agent_name="Approval Agent", action="Check Thresholds", decision="Auto-Approved", inputs="Amount=$350, Class=Economy Flex", outputs="No human required", booking_id=b1.id))
    db.commit()

    # 5. Additional Demo Bookings for Modify/Cancel Functionality
    # Using flights that exist (e.g., flight_id 10, 11, 12, 13)
    b6 = models.Booking(pnr="PNR101", customer_id=10, flight_id=10, cabin_class="Economy Saver", status="Confirmed", total_amount=450.0)
    b7 = models.Booking(pnr="PNR102", customer_id=11, flight_id=11, cabin_class="Business Class", status="Waitlisted", total_amount=2100.0)
    b8 = models.Booking(pnr="PNR103", customer_id=12, flight_id=12, cabin_class="First Class", status="Ticketed", total_amount=4500.0)
    b9 = models.Booking(pnr="PNR104", customer_id=13, flight_id=13, cabin_class="Economy Flex", status="Confirmed", total_amount=600.0)
    db.add_all([b6, b7, b8, b9])
    
    # Generate 100 Confirmed bookings for cancellation/refund workflows
    extra_bookings = []
    for i in range(100):
        c_id = random.randint(1, 100)
        f_id = random.randint(1, 200)
        # Random cabin class and amount
        cabin = random.choice(["Economy Saver", "Economy Flex", "Business Class", "First Class"])
        amt = random.randint(200, 2000)
        extra_bookings.append(
            models.Booking(
                pnr=f"PNR{200+i}", 
                customer_id=c_id, 
                flight_id=f_id, 
                cabin_class=cabin, 
                status="Confirmed", 
                total_amount=float(amt)
            )
        )
    db.add_all(extra_bookings)
    db.commit()

