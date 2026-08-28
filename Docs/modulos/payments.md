# Payments module

Create PIX at `/payments/new`. POST `/v1/payments` with `Idempotency-Key`
(`pay:` + `external_id`, or a UUID in composable memory). Display QR, poll status.
