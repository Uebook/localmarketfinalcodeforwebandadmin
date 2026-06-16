import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';
import api from '../services/api';

export default function MyRequirementsScreen(props) {
  const { navigation, route } = props;
  const themeColors = useThemeColors();
  const userData = route?.params?.userData || props.userData;

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRequirements();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchRequirements = async () => {
    if (!userData?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getRequirements({ buyer_id: userData.id });
      if (res && res.success) {
        setRequirements(res.requirements || []);
      }
    } catch (err) {
      console.warn('Failed to fetch requirements', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return themeColors.success;
      case 'accepted': return themeColors.primaryBlue;
      case 'expired': return themeColors.danger;
      default: return themeColors.textMuted;
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: themeColors.white, borderColor: themeColors.divider }]}
        onPress={() => navigation.navigate('RequirementDetails', { requirement: item, userData })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Icon name="tag" size={14} color={themeColors.textMuted} />
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>{item.category}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="package" size={14} color={themeColors.textMuted} />
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>{item.quantity} {item.unit}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="clock" size={14} color={themeColors.textMuted} />
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundSoft }]}>
      <View style={[styles.header, { backgroundColor: themeColors.white, borderBottomColor: themeColors.divider }]}>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>My Quotes</Text>
        <TouchableOpacity 
          style={[styles.newButton, { backgroundColor: themeColors.primaryOrange }]}
          onPress={() => navigation.navigate('PostRequirement', { userData })}
        >
          <Icon name="plus" size={16} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.primaryOrange} />
        </View>
      ) : requirements.length === 0 ? (
        <View style={styles.center}>
          <Icon name="clipboard" size={64} color={themeColors.divider} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Requirements Yet</Text>
          <Text style={[styles.emptySub, { color: themeColors.textSecondary }]}>
            Post a requirement to get quotations from local vendors.
          </Text>
          <TouchableOpacity 
            style={[styles.postButton, { backgroundColor: themeColors.primaryOrange }]}
            onPress={() => navigation.navigate('PostRequirement', { userData })}
          >
            <Text style={styles.postButtonText}>Post Requirement</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requirements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  newButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  postButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  postButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  listContainer: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginTop: 4 },
  footerText: { fontSize: 12, marginLeft: 4 },
});
