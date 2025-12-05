#!/bin/bash

# MongoDB startup script for the Travel Booking System
echo "Starting MongoDB for Travel Booking System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Start MongoDB and MongoDB Express
echo "Starting MongoDB container..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 10

# Test connection
echo "Testing MongoDB connection..."
if docker exec travel_booking_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running successfully!"
    echo ""
    echo "MongoDB Connection Details:"
    echo "  URI: mongodb://admin:password@localhost:27017/travel_booking?authSource=admin"
    echo "  Database: travel_booking"
    echo "  Collection: bookings"
    echo ""
    echo "MongoDB Express (Web UI):"
    echo "  URL: http://localhost:8081"
    echo "  Username: admin"
    echo "  Password: admin"
    echo ""
    echo "To stop MongoDB: docker-compose down"
    echo "To view logs: docker-compose logs -f mongodb"
else
    echo "❌ MongoDB failed to start. Check logs with: docker-compose logs mongodb"
    exit 1
fi