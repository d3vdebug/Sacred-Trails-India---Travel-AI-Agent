"""
MongoDB utilities for booking operations
"""
import os
import logging
from typing import List, Dict, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from datetime import datetime

logger = logging.getLogger("mongodb")

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "travel_booking")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "bookings")

# Global client connection
_client = None
_db = None
_collection = None

def get_mongodb_connection():
    """Get MongoDB connection, creating it if necessary."""
    global _client, _db, _collection
    
    if _client is None:
        try:
            _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Test connection
            _client.admin.command('ping')
            _db = _client[MONGODB_DB_NAME]
            _collection = _db[MONGODB_COLLECTION]
            
            # Create unique index on booking_id
            _collection.create_index("booking_id", unique=True)
            
            logger.info(f"Connected to MongoDB: {MONGODB_DB_NAME}.{MONGODB_COLLECTION}")
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    return _client, _db, _collection

def load_bookings() -> List[Dict]:
    """Load all bookings from MongoDB."""
    try:
        client, db, collection = get_mongodb_connection()
        bookings = list(collection.find({}, {'_id': 0}))  # Exclude MongoDB _id field
        logger.info(f"Loaded {len(bookings)} bookings from MongoDB")
        return bookings
    except Exception as e:
        logger.error(f"Error loading bookings from MongoDB: {e}")
        return []

def save_booking(booking: Dict) -> bool:
    """Save a single booking to MongoDB."""
    try:
        client, db, collection = get_mongodb_connection()
        # Add timestamp if not present
        if 'timestamp' not in booking:
            booking['timestamp'] = datetime.now().isoformat()
        
        # Insert booking
        collection.insert_one(booking)
        logger.info(f"Saved booking {booking.get('booking_id')} to MongoDB")
        return True
    except DuplicateKeyError:
        logger.error(f"Booking ID {booking.get('booking_id')} already exists")
        return False
    except Exception as e:
        logger.error(f"Error saving booking to MongoDB: {e}")
        return False

def update_booking(booking_id: str, updates: Dict) -> bool:
    """Update a booking in MongoDB."""
    try:
        client, db, collection = get_mongodb_connection()
        result = collection.update_one(
            {"booking_id": booking_id.upper()},
            {"$set": updates}
        )
        if result.matched_count > 0:
            logger.info(f"Updated booking {booking_id} in MongoDB")
            return True
        else:
            logger.warning(f"Booking {booking_id} not found for update")
            return False
    except Exception as e:
        logger.error(f"Error updating booking in MongoDB: {e}")
        return False

def get_booking(booking_id: str) -> Optional[Dict]:
    """Get a single booking by ID from MongoDB."""
    try:
        client, db, collection = get_mongodb_connection()
        booking = collection.find_one({"booking_id": booking_id.upper()}, {'_id': 0})
        if booking:
            logger.info(f"Retrieved booking {booking_id} from MongoDB")
        else:
            logger.info(f"Booking {booking_id} not found in MongoDB")
        return booking
    except Exception as e:
        logger.error(f"Error retrieving booking from MongoDB: {e}")
        return None

def delete_booking(booking_id: str) -> bool:
    """Delete a booking from MongoDB."""
    try:
        client, db, collection = get_mongodb_connection()
        result = collection.delete_one({"booking_id": booking_id.upper()})
        if result.deleted_count > 0:
            logger.info(f"Deleted booking {booking_id} from MongoDB")
            return True
        else:
            logger.warning(f"Booking {booking_id} not found for deletion")
            return False
    except Exception as e:
        logger.error(f"Error deleting booking from MongoDB: {e}")
        return False

def close_connection():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("Closed MongoDB connection")
        _client = None

# Register cleanup function
import atexit
atexit.register(close_connection)