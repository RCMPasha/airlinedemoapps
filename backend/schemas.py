from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AirportBase(BaseModel):
    code: str
    name: str
    city: str
    country: str

class Airport(AirportBase):
    class Config:
        orm_mode = True

class FlightBase(BaseModel):
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    aircraft_type: str
    status: str
    base_price: float

class Flight(FlightBase):
    id: int
    class Config:
        orm_mode = True

class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    loyalty_tier: str

class Customer(CustomerBase):
    id: int
    class Config:
        orm_mode = True

class BookingBase(BaseModel):
    pnr: str
    customer_id: int
    flight_id: int
    cabin_class: str
    status: str
    total_amount: float

class BookingCreate(BaseModel):
    flight_id: int
    customer_id: int
    cabin_class: str
    passengers: int = 1

class Booking(BookingBase):
    id: int
    booking_date: datetime
    flight: Optional[Flight] = None
    customer: Optional[Customer] = None
    
    class Config:
        orm_mode = True

class RefundRequestBase(BaseModel):
    reason: str

class RefundRequestCreate(RefundRequestBase):
    booking_id: int

class RefundRequest(RefundRequestBase):
    id: int
    booking_id: int
    status: str
    refund_amount: float
    ai_recommendation: Optional[str] = None
    confidence_score: Optional[float] = None
    human_approval_required: bool
    supervisor_comments: Optional[str] = None
    request_date: datetime
    booking: Optional[Booking] = None
    
    class Config:
        orm_mode = True

class AuditLogBase(BaseModel):
    agent_name: str
    action: str
    decision: str
    inputs: str
    outputs: str
    booking_id: Optional[int] = None

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

class Policy(BaseModel):
    name: str
    description: str

    class Config:
        orm_mode = True
