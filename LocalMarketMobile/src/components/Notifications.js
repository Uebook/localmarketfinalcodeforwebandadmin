import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';

const Notifications = ({ navigation, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Local!",
      message: "Find the best services and vendors near you. Start exploring now!",
      time: "Just now",
      iconName: 'Bell',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      isRead: false,
    },
    {
      id: 2,
      title: "50% Off Sale",
      message: "Great discounts on Electronics this weekend at Nehru Place.",
      time: "2 hours ago",
      iconName: 'Tag',
      color: '#9333ea',
      bgColor: '#f3e8ff',
      isRead: false,
    },
    {
      id: 3,
      title: "Order Status",
      message: "Your enquiry to 'Tech World Repairs' has been viewed.",
      time: "1 day ago",
      iconName: 'Clock',
      color: '#16a34a',
      bgColor: '#dcfce7',
      isRead: true,
    },
    {
      id: 4,
      title: "New Vendor Added",
      message: "A new restaurant 'Joe's Pizza & Grill' has opened near you!",
      time: "2 days ago",
      iconName: 'Store',
      color: '#ea580c',
      bgColor: '#fed7aa',
      isRead: true,
    },
    {
      id: 5,
      title: "Review Request",
      message: "How was your experience at 'City Care Pharmacy'? Share your feedback.",
      time: "3 days ago",
      iconName: 'Star',
      color: '#fbbf24',
      bgColor: '#fef3c7',
      isRead: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    // Handle navigation based on notification type
    if (onClose) {
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.notificationItemUnread]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
        <Icon name={getIconName(item.iconName) || item.iconName.toLowerCase()} size={20} color={item.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Icon name={getIconName('Bell')} size={20} color="#dc2626" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <Text style={styles.headerSubtitle}>{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Icon name={getIconName('X')} size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Notifications List */}
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name={getIconName('Bell')} size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No notifications</Text>
              </View>
            }
          />

          {/* Footer */}
          {notifications.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 64,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    gap: 12,
    backgroundColor: '#ffffff',
  },
  notificationItemUnread: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  titleUnread: {
    color: '#1e293b',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  markAllButton: {
    alignItems: 'center',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 16,
  },
});

export default Notifications;
