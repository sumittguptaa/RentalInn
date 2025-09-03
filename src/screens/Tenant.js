import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, FAB, Menu, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchTenants,
  putTenantOnNotice,
  deleteTenant,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';

const Tenants = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [anchorBedId, setAnchorBedId] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [filterOptions, setFilterOptions] = useState([
    { label: 'All', key: 'all', value: 0 },
    { label: 'Dues', key: 'dues', value: 0 },
    { label: 'No Dues', key: 'no_dues', value: 0 },
    { label: 'Notice', key: 'notice', value: 0 },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTenants(
        credentials.accessToken,
        credentials.property_id,
      );
      const tenantsList = res.data.items || [];
      setTenants(tenantsList);

      const allCount = tenantsList.length;
      const duesCount = tenantsList.filter(t => t.has_dues).length;
      const noDuesCount = tenantsList.filter(t => !t.has_dues).length;
      const noticeCount = tenantsList.filter(t => t.is_on_notice).length;

      setFilterOptions([
        { label: 'All', key: 'all', value: allCount },
        { label: 'Dues', key: 'dues', value: duesCount },
        { label: 'No Dues', key: 'no_dues', value: noDuesCount },
        { label: 'Notice', key: 'notice', value: noticeCount },
      ]);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
    setLoading(false);
  }, [credentials]);

  // Filter tenants based on selectedFilter and search
  const filteredTenants = tenants.filter(tenant => {
    // Search filter
    const matchesSearch = tenant.name
      .toLowerCase()
      .includes(search.toLowerCase());
    // Filter chips
    if (selectedFilter === 'dues') {
      return tenant.has_dues && matchesSearch;
    } else if (selectedFilter === 'no_dues') {
      return !tenant.has_dues && matchesSearch;
    } else if (selectedFilter === 'notice') {
      return tenant.is_on_notice && matchesSearch;
    }
    // 'all' filter
    return matchesSearch;
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Main content */}
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Search */}
            <PaperInput
              mode="flat"
              placeholder="Search Tenants..."
              value={search}
              onChangeText={setSearch}
              style={[styles.searchBar, { fontFamily: 'Metropolis-Medium' }]}
              left={<PaperInput.Icon icon="magnify" />}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              contentStyle={{ fontFamily: 'Metropolis-Medium' }}
              theme={{
                roundness: 25,
                colors: {
                  background: '#fff',
                  text: '#000',
                  placeholder: '#888',
                },
              }}
            />

            <Gap size="md" />

            {/* Filters as Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {filterOptions.map(option => (
                <Chip
                  key={option.key}
                  selected={selectedFilter === option.key}
                  onPress={() => setSelectedFilter(option.key)}
                  style={[
                    styles.chip,
                    selectedFilter === option.key && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  textStyle={{
                    color: selectedFilter === option.key ? '#fff' : '#000',
                    fontFamily: 'Metropolis-Medium',
                  }}
                >
                  {option.label} ({option.value})
                </Chip>
              ))}
            </ScrollView>

            {/* Loader */}
            {loading && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <StandardText>Loading tenants...</StandardText>
              </View>
            )}

            {/* Tenant Cards */}
            {filteredTenants.map(tenant => (
              <StandardCard key={tenant.id} style={styles.card}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('TenantDetails', { tenant })
                  }
                >
                  <View style={styles.row}>
                    {/* Avatar */}
                    <Avatar.Image
                      size={60}
                      source={{
                        uri: 'https://avatar.iran.liara.run/public/37',
                      }}
                      style={{ marginRight: 14 }}
                    />

                    {/* Info Section */}
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowBetween}>
                        <StandardText fontWeight="bold" size="lg">
                          {tenant.name}
                        </StandardText>

                        {/* Menu */}
                        <Menu
                          visible={menuVisible && anchorBedId === tenant.id}
                          onDismiss={() => {
                            setMenuVisible(false);
                            setAnchorBedId(null);
                          }}
                          anchor={
                            <TouchableOpacity
                              onPress={() => {
                                setMenuVisible(true);
                                setAnchorBedId(tenant.id);
                              }}
                            >
                              <MaterialCommunityIcons
                                name="dots-vertical"
                                size={22}
                                color="#444"
                              />
                            </TouchableOpacity>
                          }
                        >
                          <Menu.Item onPress={() => {}} title="Edit" />
                          <Menu.Item onPress={() => {}} title="Share" />
                          <Menu.Item
                            onPress={() => {
                              putTenantOnNotice(
                                credentials.accessToken,
                                tenant.id,
                                { notice: true },
                              );
                            }}
                            title="Put on Notice"
                          />
                          <Menu.Item
                            onPress={async () => {
                              await deleteTenant(
                                credentials.accessToken,
                                tenant.id,
                              );
                              fetchData();
                            }}
                            title="Delete"
                          />
                        </Menu>
                      </View>

                      {/* Quick badges */}
                      <View style={{ flexDirection: 'row', marginTop: 6 }}>
                        {tenant.has_dues && (
                          <Chip
                            style={styles.badgeDues}
                            textStyle={{ color: '#fff' }}
                          >
                            Dues
                          </Chip>
                        )}
                        {tenant.is_on_notice && (
                          <Chip
                            style={styles.badgeNotice}
                            textStyle={{ color: '#fff' }}
                          >
                            Notice
                          </Chip>
                        )}
                      </View>

                      {/* Small details */}
                      <View style={{ marginTop: 8 }}>
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons
                            name="bed"
                            size={18}
                            color="#555"
                          />
                          <StandardText style={styles.detailText}>
                            {tenant.room.name}
                          </StandardText>
                        </View>

                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons
                            name="cash"
                            size={18}
                            color="#555"
                          />
                          <StandardText style={styles.detailText}>
                            ₹{tenant.room.rentAmount}
                          </StandardText>
                        </View>

                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons
                            name="calendar-check"
                            size={18}
                            color="#555"
                          />
                          <StandardText style={styles.detailText}>
                            Joined: {tenant.check_in_date}
                          </StandardText>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </StandardCard>
            ))}

            <Gap size="xl" />
          </ScrollView>

          {/* Floating Add Button */}
          <FAB
            icon="plus"
            color="#fff"
            style={styles.fab}
            onPress={() => navigation.navigate('AddTenant')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, marginTop: 25 },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { marginLeft: 6, color: '#444' },
  badgeDues: {
    backgroundColor: '#e53935',
    marginRight: 6,
    height: 26,
  },
  badgeNotice: {
    backgroundColor: '#ff9800',
    marginRight: 6,
    height: 26,
  },
  fab: {
    position: 'absolute',
    right: 30,
    borderRadius: 30,
    bottom: 120,
    backgroundColor: colors.primary,
  },
});

export default Tenants;
