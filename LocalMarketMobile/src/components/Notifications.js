import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';
import { getNotifications, markNotificationsRead } from '../services/api';

const { width } = Dimensions.get('window');

const Notifications = ({ navigation, onClose }) => {
  const COLORS = useThemeColors();
  const styles = createStyles(COLORS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      if (data && data.notifications) {
        setNotifications(transformNotifications(data.notifications));
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const transformNotifications = (apiNotifications) => {
    const typeMap = {
      'info': { icon: 'info', color: '#3b82f6', bg: '#eff6ff' },
      'success': { icon: 'check-circle', color: '#10b981', bg: '#ecfdf5' },
      'warning': { icon: 'alert-triangle', color: '#f59e0b', bg: '#fffbeb' },
      'error': { icon: 'alert-circle', color: '#ef4444', bg: '#fef2f2' },
      'promo': { icon: 'tag', color: '#8b5cf6', bg: '#f5f3ff' },
      'price_drop': { icon: 'trending-down', color: '#ec4899', bg: '#fdf2f8' },
    };

    return apiNotifications.map((n, i) => {
      const type = typeMap[n.type] || typeMap['info'];
      return {
        ...n,
        id: n.id || i,
        icon: type.icon,
        color: type.color,
        bgColor: type.bg,
        isRead: n.read || n.isRead || false,
        timeAgo: formatTime(n.created_at)
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.createdAt || a.created_at));
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const handleMarkAllRead = async () => {
    if (markingRead) return;
    setMarkingRead(true);
    
    // Update local state first for instant feedback
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const result = await markNotificationsRead();
      if (!result.success) {
        // Option to revert if failed, but usually silent is better for UX
      }
    } catch (error) {
      console.warn('API Mark Read failed:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNotificationPress = (notification) => {
    // Navigate or show details
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else if (onClose) {
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.notifUnread]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
        <Icon name={getIconName(item.icon) || item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.notifBody}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, !item.isRead && styles.textBold]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.timeRow}>
            <Icon name="clock" size={10} color="#94A3B8" />
            <Text style={styles.notifTime}>{item.timeAgo}</Text>
          </View>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message || item.body}
        </Text>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Icon name={getIconName('ChevronLeft')} size={28} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadTag}>
                <Text style={styles.unreadTagText}>{unreadCount} NEW</Text>
              </View>
            )}
          </View>
        </View>

        {/* Global Action Bar */}
        {notifications.length > 0 && (
          <View style={styles.actionBar}>
             <Text style={styles.notifCount}>{notifications.length} Total Alerts</Text>
             <TouchableOpacity 
               onPress={handleMarkAllRead} 
               style={[styles.readAllBtn, markingRead && styles.btnDisabled]}
               disabled={markingRead}
             >
               {markingRead ? (
                 <ActivityIndicator size="small" color="#FF6B00" />
               ) : (
                 <>
                   <Icon name="check-square" size={14} color="#FF6B00" style={{marginRight: 4}} />
                   <Text style={styles.readAllText}>Mark all as read</Text>
                 </>
               )}
             </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Fetching updates...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <Icon name="bell-off" size={42} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySubtitle}>We'll let you know when something important happens.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    padding: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  unreadTag: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    // Shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notifCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B00',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  listContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  notifUnread: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(255, 107, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBody: {
    flex: 1,
    position: 'relative',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  textBold: {
    fontWeight: '900',
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    right: -4,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default Notifications;
