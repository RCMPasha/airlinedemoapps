# Meridian Airways AI Agent Skills

This document catalogs the functions, APIs, and system actions (skills) that the AI Agents require to interact with the backend database and execute their autonomous workflows.

## 1. Data Retrieval Skills

### `get_booking_details(pnr: str) -> dict`
- **Description:** Fetches all details for a given Passenger Name Record.
- **Agent:** Booking Agent
- **Returns:** Customer ID, Flight ID, Cabin Class, Total Amount, Booking Status.

### `get_flight_status(flight_id: int) -> dict`
- **Description:** Checks the current operational status of a flight.
- **Agent:** Policy Agent / Eligibility Agent
- **Returns:** Status (Scheduled, Delayed, Cancelled), Departure Time, Arrival Time.

### `get_customer_history(customer_id: int) -> dict`
- **Description:** Retrieves the loyalty tier and historical booking/refund data for a customer.
- **Agent:** Risk Agent
- **Returns:** Loyalty Tier, Total Past Bookings, Total Past Refunds, Account Age.

## 2. Analytical & Evaluative Skills

### `calculate_refund_deduction(base_amount: float, cabin_class: str) -> float`
- **Description:** Computes the standard cancellation fee deduction based on cabin rules.
- **Agent:** Eligibility Agent
- **Returns:** Calculated deduction amount (e.g., $50 for Economy Flex, $0 for Business).

### `compute_fraud_score(customer_id: int, refund_history_count: int) -> int`
- **Description:** Runs a heuristic algorithm or ML inference to generate a fraud risk score (0-100).
- **Agent:** Risk Agent
- **Returns:** Integer representing the risk level.

## 3. Transactional Action Skills

### `update_booking_status(pnr: str, status: str)`
- **Description:** Updates the main booking database table to reflect the new state (e.g., 'Refund Requested', 'Cancelled').
- **Agent:** Approval Agent
- **Parameters:** `pnr` (string), `status` (string).

### `create_refund_request(booking_id: int, reason: str, amount: float, ai_rec: str, conf_score: float, human_req: bool)`
- **Description:** Inserts a new record into the `refund_requests` table to track the financial transaction.
- **Agent:** Approval Agent

### `process_payment_refund(refund_id: int, amount: float)`
- **Description:** Interfaces with the external Payment Gateway (e.g., Stripe) to actually reverse the funds to the customer's credit card.
- **Agent:** Financial Agent / Orchestrator

## 4. Communication Skills

### `send_customer_email(customer_id: int, template: str, dynamic_data: dict)`
- **Description:** Triggers an email notification to the customer's registered email address.
- **Agent:** Notification Agent
- **Parameters:** Email template ID (e.g., 'refund_approved', 'refund_pending'), variables for PNR, amount, etc.

### `log_audit_trail(agent_name: str, action: str, decision: str, inputs: str, outputs: str, booking_id: int)`
- **Description:** Writes an immutable record to the `audit_logs` table for observability on the AIOps Console.
- **Agent:** ALL AGENTS (used implicitly or explicitly after every decision).
