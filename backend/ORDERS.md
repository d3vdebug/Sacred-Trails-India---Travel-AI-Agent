# Order Saving Functionality

This document explains how orders are saved as JSON files in the Code Cafe Barista AI system.

## Overview

When a customer completes their coffee order through the voice agent, the order details are automatically saved as a JSON file in the `orders/` directory.

## Order Structure

Each order is saved as a JSON file with the following structure:

```json
{
  "drink": "latte",
  "size": "medium",
  "milk": "oat",
  "extras": ["whipped cream"],
  "name": "Customer Name",
  "timestamp": "2025-11-23T11:39:14.761278+00:00",
  "order_id": "20251123T113914"
}
```

### Field Descriptions

- **drink**: Type of coffee (latte, cappuccino, espresso, americano, mocha)
- **size**: Size of the drink (small, medium, large)
- **milk**: Type of milk (regular, oat, almond, soy)
- **extras**: Array of additional items (whipped cream, syrups, etc.)
- **name**: Customer's name
- **timestamp**: ISO 8601 formatted timestamp when the order was placed
- **order_id**: Unique identifier based on timestamp (YYYYMMDDTHHMMSS format)

## File Naming

Orders are saved with filenames in the format:
- `order_YYYYMMDDTHHMMSS.json` (for actual orders from the voice agent)
- `test_order_YYYYMMDDTHHMMSS.json` (for test orders)

## File Location

Orders are saved in the `backend/orders/` directory, which is created automatically if it doesn't exist.

## Error Handling

The system includes robust error handling:
- If the orders directory cannot be created, an error is logged but the session continues
- If the JSON file cannot be written, the error is logged for debugging
- The voice agent continues normal operation even if order saving fails

## Testing

A test script is provided to verify the order saving functionality:

```bash
cd backend
python test_order_save.py
```

This creates a test order and verifies that all fields are saved correctly.

## Integration

The order saving functionality is integrated into the main voice agent flow:

1. Customer completes their order through voice conversation
2. Order data is collected in a structured format
3. Additional metadata (timestamp, order_id) is added
4. Order is saved to JSON file in the orders directory
5. Customer receives confirmation message
6. Call ends gracefully

## Dependencies

- Python 3.8+ (uses `datetime.UTC` for timezone-aware timestamps)
- Standard library modules: `os`, `json`, `asyncio`, `logging`, `datetime`