import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';

// Context
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';

// Theme
import colors from '../theme/color';

const Notices = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with API call
  const mockNotices = [
    {
      id: '1',
      title: 'Rent Due Reminder',
      description: 'Monthly rent payment is due for Room 101',
      type: 'payment',
      priority: 'high',
      date: '2025-09-05',
      tenantName: 'John Doe',
      roomNumber: '101',
      amount: '₹15,000',
      status: 'pending',
      isRead: false,
    },
    {
      id: '2',
      title: 'Maintenance Request',
      description: 'Air conditioning repair needed in Room 205',
      type: 'maintenance',
      priority: 'medium',
      date: '2025-09-04',
      tenantName: 'Jane Smith',
      roomNumber: '205',
      status: 'in-progress',
      isRead: true,
    },
    {
      id: '3',
      title: 'Lease Expiry Notice',
      description: 'Lease agreement expires in 30 days for Room 303',
      type: 'lease',
      priority: 'high',
      date: '2025-09-03',
      tenantName: 'Mike Johnson',
      roomNumber: '303',
      expiryDate: '2025-10-05',
      status: 'pending',
      isRead: false,
    },
    {
      id: '4',
      title: 'New Tenant Welcome',
      description: 'Welcome package sent to new tenant in Room 102',
      type: 'general',
      priority: 'low',
      date: '2025-09-02',
      tenantName: 'Sarah Wilson',
      roomNumber: '102',
      status: 'completed',
      isRead: true,
    },
  ];

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
    { key: 'payment', label: 'Payment', icon: 'cash-outline' },
    { key: 'maintenance', label: 'Maintenance', icon: 'construct-outline' },
    { key: 'lease', label: 'Lease', icon: 'document-text-outline' },
  ];

  // Theme-aware colors
  const themeColors = {
    backgroundColor:
      mode === 'dark' ? colors.backgroundDark || '#1a1a1a' : colors.white,
    textPrimary:
      mode === 'dark' ? colors.white : colors.textPrimary || colors.black,
    textSecondary:
      mode === 'dark'
        ? colors.gray200 || '#b3b3b3'
        : colors.textSecondary || '#666',
    cardBackground:
      mode === 'dark' ? colors.gray800 || '#2a2a2a' : colors.white,
    borderColor:
      mode === 'dark'
        ? colors.gray700 || '#404040'
        : colors.gray200 || '#e0e0e0',
  };

  // Priority colors
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return colors.error || '#ff4444';
      case 'medium':
        return colors.warning || '#ff9500';
      case 'low':
        return colors.success || '#00c851';
      default:
        return colors.gray500 || '#9e9e9e';
    }
  };

  // Type icons
  const getTypeIcon = type => {
    switch (type) {
      case 'payment':
        return 'cash-outline';
      case 'maintenance':
        return 'construct-outline';
      case 'lease':
        return 'document-text-outline';
      case 'general':
        return 'information-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  // Load notices
  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotices(mockNotices);
    } catch (error) {
      console.error('Failed to load notices:', error);
      Alert.alert('Error', 'Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh notices
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  }, [loadNotices]);

  // Filter notices
  const filteredNotices = notices.filter(notice => {
    switch (selectedFilter) {
      case 'unread':
        return !notice.isRead;
      case 'payment':
      case 'maintenance':
      case 'lease':
        return notice.type === selectedFilter;
      default:
        return true;
    }
  });

  // Mark notice as read
  const markAsRead = useCallback(noticeId => {
    setNotices(prev =>
      prev.map(notice =>
        notice.id === noticeId ? { ...notice, isRead: true } : notice,
      ),
    );
  }, []);

  // Handle notice action
  const handleNoticeAction = useCallback(
    notice => {
      markAsRead(notice.id);

      // Navigate based on notice type
      switch (notice.type) {
        case 'payment':
          // Navigate to payment details or create payment reminder
          Alert.alert(
            'Payment Notice',
            `Handle payment for ${notice.tenantName} - ${notice.amount}`,
          );
          break;
        case 'maintenance':
          // Navigate to maintenance/tickets
          navigation.navigate('Tickets');
          break;
        case 'lease':
          // Navigate to tenant details
          navigation.navigate('TenantDetails', { tenantId: notice.tenantName });
          break;
        default:
          Alert.alert('Notice', notice.description);
      }
    },
    [navigation, markAsRead],
  );

  // Render notice item
  const renderNoticeItem = ({ item: notice }) => (
    <TouchableOpacity
      onPress={() => handleNoticeAction(notice)}
      activeOpacity={0.7}
      style={{ marginBottom: 12 }}
    >
      <StandardCard
        style={[
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.borderColor,
            borderWidth: 1,
            borderLeftWidth: 4,
            borderLeftColor: getPriorityColor(notice.priority),
          },
          !notice.isRead && {
            backgroundColor: mode === 'dark' ? '#1e2a3a' : '#f0f8ff',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              backgroundColor: getPriorityColor(notice.priority),
              padding: 8,
              borderRadius: 8,
              marginRight: 12,
            }}
          >
            <Icon
              name={getTypeIcon(notice.type)}
              size={20}
              color={colors.white}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <StandardText
                fontWeight="bold"
                size="medium"
                style={{ color: themeColors.textPrimary, flex: 1 }}
              >
                {notice.title}
              </StandardText>

              {!notice.isRead && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                    marginLeft: 8,
                  }}
                />
              )}
            </View>

            <StandardText
              style={{ color: themeColors.textSecondary, marginBottom: 8 }}
            >
              {notice.description}
            </StandardText>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="person-outline"
                  size={14}
                  color={themeColors.textSecondary}
                />
                <StandardText
                  size="small"
                  style={{ color: themeColors.textSecondary, marginLeft: 4 }}
                >
                  {notice.tenantName}
                </StandardText>

                {notice.roomNumber && (
                  <>
                    <Icon
                      name="location-outline"
                      size={14}
                      color={themeColors.textSecondary}
                      style={{ marginLeft: 12 }}
                    />
                    <StandardText
                      size="small"
                      style={{
                        color: themeColors.textSecondary,
                        marginLeft: 4,
                      }}
                    >
                      Room {notice.roomNumber}
                    </StandardText>
                  </>
                )}
              </View>

              <StandardText
                size="small"
                style={{ color: themeColors.textSecondary }}
              >
                {notice.date}
              </StandardText>
            </View>

            {notice.amount && (
              <View
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name="cash-outline" size={16} color={colors.success} />
                <StandardText
                  fontWeight="semibold"
                  style={{ color: colors.success, marginLeft: 4 }}
                >
                  {notice.amount}
                </StandardText>
              </View>
            )}
          </View>
        </View>
      </StandardCard>
    </TouchableOpacity>
  );

  // Render filter chip
  const renderFilterChip = filter => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        onPress={() => setSelectedFilter(filter.key)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: isSelected
            ? colors.primary
            : themeColors.cardBackground,
          borderRadius: 20,
          marginRight: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isSelected ? colors.primary : themeColors.borderColor,
        }}
      >
        <Icon
          name={filter.icon}
          size={16}
          color={isSelected ? colors.white : themeColors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <StandardText
          size="small"
          fontWeight={isSelected ? 'semibold' : 'regular'}
          style={{
            color: isSelected ? colors.white : themeColors.textSecondary,
          }}
        >
          {filter.label}
        </StandardText>
      </TouchableOpacity>
    );
  };

  // Load notices on mount
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeColors.backgroundColor,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.borderColor,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <StandardText
              fontWeight="bold"
              size="large"
              style={{ color: themeColors.textPrimary }}
            >
              Notices
            </StandardText>
            <StandardText
              style={{ color: themeColors.textSecondary, marginTop: 2 }}
            >
              {filteredNotices.length}{' '}
              {filteredNotices.length === 1 ? 'notice' : 'notices'}
            </StandardText>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Create Notice', 'Feature coming soon!')}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Icon name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        {filterOptions.map(renderFilterChip)}
      </ScrollView>

      {/* Notices List */}
      <FlatList
        data={filteredNotices}
        renderItem={renderNoticeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100, // Account for bottom tab bar
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={64}
              color={themeColors.textSecondary}
            />
            <StandardText
              fontWeight="semibold"
              size="large"
              style={{ color: themeColors.textPrimary, marginTop: 16 }}
            >
              No Notices
            </StandardText>
            <StandardText
              style={{
                color: themeColors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {selectedFilter === 'all'
                ? 'You have no notices at the moment'
                : `No ${selectedFilter} notices found`}
            </StandardText>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Notices;
