# Policy definitions for Meridian Airways
# These are the same rules used in the cancel_booking endpoint.
# They are exposed via the /api/policies endpoint for UI or external services.

POLICIES = {
    "Economy Saver": "Non-refundable unless the airline cancels the flight or a valid medical emergency is provided.",
    "Economy Flex": "Refundable up to 4 hours before departure with a $50 cancellation fee.",
    "Business Class": "Fully refundable. Refunds exceeding $2,500 require mandatory human supervisor approval.",
    "First Class": "Fully refundable. Refunds exceeding $2,500 require mandatory human supervisor approval."
}
