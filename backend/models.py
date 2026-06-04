from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Airport(Base):
    __tablename__ = "airports"
    code = Column(String, primary_key=True, index=True)
    name = Column(String)
    city = Column(String)
    country = Column(String)

class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String, index=True)
    origin = Column(String, ForeignKey("airports.code"))
    destination = Column(String, ForeignKey("airports.code"))
    departure_time = Column(DateTime)
    arrival_time = Column(DateTime)
    aircraft_type = Column(String)
    status = Column(String, default="Scheduled")  # Scheduled, Cancelled, Delayed, Boarding, In Air, Landed
    base_price = Column(Float)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    loyalty_tier = Column(String, default="Blue") # Blue, Silver, Gold, Platinum

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    pnr = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    flight_id = Column(Integer, ForeignKey("flights.id"))
    booking_date = Column(DateTime, default=datetime.datetime.utcnow)
    cabin_class = Column(String) # Economy Saver, Economy Flex, Business Class, First Class
    status = Column(String, default="Confirmed") # Confirmed, Ticketed, Waitlisted, Cancelled, Refund Requested, Refunded
    total_amount = Column(Float)
    
    customer = relationship("Customer")
    flight = relationship("Flight")

class RefundRequest(Base):
    __tablename__ = "refund_requests"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    reason = Column(String)
    status = Column(String, default="Pending") # Pending, Running, Approved, Rejected, Completed, Manual Review
    refund_amount = Column(Float)
    ai_recommendation = Column(String)
    confidence_score = Column(Float)
    human_approval_required = Column(Boolean, default=False)
    supervisor_comments = Column(String, nullable=True)
    request_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    booking = relationship("Booking")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    agent_name = Column(String)
    action = Column(String)
    decision = Column(String)
    inputs = Column(String)
    outputs = Column(String)
    booking_id = Column(Integer, nullable=True)
