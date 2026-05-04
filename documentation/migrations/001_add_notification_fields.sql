-- Add notification_type and navigation_url columns to notifications table
ALTER TABLE notifications 
ADD COLUMN notification_type VARCHAR(100),
ADD COLUMN navigation_url VARCHAR(500);

-- Create index on notification_type for better query performance
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Create index on receiver_id and status for faster filtering
CREATE INDEX idx_notifications_receiver_status ON notifications(receiver_id, status);
