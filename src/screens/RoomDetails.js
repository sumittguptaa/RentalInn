import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Avatar, Chip, Menu, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/color';
import {
  deleteTenant,
  getDocument,
  getTenants,
  putTenantOnNotice,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';

const RoomDetails = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);

  const { room } = route.params;

  const scrollX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const [imageUrls, setImageUrls] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (
        room.image_document_id_list &&
        room.image_document_id_list.length > 0
      ) {
        const urls = await Promise.all(
          room.image_document_id_list.map(async docId => {
            try {
              const res = await getDocument(
                credentials.accessToken,
                credentials.property_id,
                docId,
              );

              return res.data.download_url;
            } catch (e) {
              console.error('Error fetching document for ID', docId, e);
              return null;
            }
          }),
        );

        setImageUrls(urls.filter(Boolean));
      }
    };
    const fetchTenants = async () => {
      const res = await getTenants(
        credentials.accessToken,
        credentials.property_id,
        room.id,
      );
      setTenants(res.data);
    };
    fetchImageUrls();
    fetchTenants();
  }, [
    room.image_document_id_list,
    credentials.accessToken,
    credentials.property_id,
    room.id,
  ]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [anchorBedId, setAnchorBedId] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Image Carousel */}
      <View style={{ height: 250, marginBottom: 12 }}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        >
          {imageUrls.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={{
                width: screenWidth,
                height: 250,
                resizeMode: 'cover',
              }}
            />
          ))}
        </Animated.ScrollView>

        {/* Dots */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            alignSelf: 'center',
            flexDirection: 'row',
          }}
        >
          {imageUrls.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                screenWidth * (index - 1),
                screenWidth * index,
                screenWidth * (index + 1),
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={{
                  height: 6,
                  width: 50,
                  backgroundColor: '#000',
                  opacity,
                  margin: 4,
                  borderRadius: 5,
                }}
              />
            );
          })}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 16,
          marginTop: -20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="door"
            size={40}
            color={colors.primary}
          />
          <StandardText style={{ marginLeft: 6 }} fontWeight="bold" size="xl">
            Room {room.name}
          </StandardText>
        </View>

        <View
          style={{
            backgroundColor: room.status === 'vacant' ? '#DFF5E1' : '#FFF2D8',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 15,
          }}
        >
          <Text
            style={{
              color: room.status === 'vacant' ? '#219653' : '#F2994A',
              fontWeight: 'bold',
              fontSize: 12,
            }}
          >
            {room.available ? 'Available' : 'Occupied'}
          </Text>
        </View>
      </View>

      {/* Horizonatal Line */}
      <View
        style={{
          height: 1,
          backgroundColor: '#E0E0E0',
          marginVertical: 10,
          marginHorizontal: 25,
          width: '70%',
          borderRadius: 5,
          alignSelf: 'center',
        }}
      />

      <ScrollView style={{ paddingHorizontal: 15, paddingTop: 10 }}>
        <View style={{ gap: 20 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {/* LEFT COLUMN */}
            <View>
              {/* Bed Count */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="bed" size={22} color="#000" />
                <StandardText
                  style={{ marginLeft: 6 }}
                  fontWeight="bold"
                  size="md"
                >
                  Bed: <Text style={{ color: '#F2994A' }}>{room.bedCount}</Text>
                </StandardText>
              </View>

              {/* Available */}
              <StandardText
                style={{ marginLeft: 28, color: 'gray', marginTop: 4 }}
                size="sm"
              >
                Available:{' '}
                {room.bedCount > 0 &&
                  Array.from({ length: room.bedCount - tenants.length }).map(
                    (_, index) => (
                      <MaterialCommunityIcons
                        key={index}
                        name="bed"
                        size={18}
                        color="#F2C94C"
                      />
                    ),
                  )}
              </StandardText>

              {/* Occupied */}
              <StandardText
                style={{ marginLeft: 28, color: 'gray', marginTop: 2 }}
                size="sm"
              >
                Occupied:{' '}
                {!!tenants &&
                  tenants.length > 0 &&
                  tenants.map((tenant, index) => (
                    <MaterialCommunityIcons
                      key={index}
                      name="bed"
                      size={18}
                      color="#BDBDBD"
                    />
                  ))}
              </StandardText>

              {/* Rent Due */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <MaterialCommunityIcons name="cash" size={22} color="#000" />
                <StandardText
                  style={{ marginLeft: 6 }}
                  fontWeight="bold"
                  size="md"
                >
                  Rent Due:{' '}
                  <Text style={{ color: '#F2994A' }}>
                    {room.rentDueCount || 0}
                  </Text>
                </StandardText>
              </View>
              {/* Rent Due People */}
              <View style={{ marginLeft: 28, marginTop: 6 }}>
                {['Rihaa Kapoor', 'Schmidt'].map((name, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    {/* <Avatar.Image
                      size={24}
                      source={require('../assets/avatar-placeholder.png')} // Replace with real image if needed
                    /> */}
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={22}
                      color="#000"
                    />
                    <StandardText style={{ marginLeft: 8 }} size="sm">
                      {name}
                    </StandardText>
                  </View>
                ))}
              </View>
            </View>

            {/* RIGHT COLUMN */}
            <View>
              {/* Active Ticket */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={22}
                  color="#000"
                />
                <StandardText
                  style={{ marginLeft: 6 }}
                  fontWeight="bold"
                  size="md"
                >
                  Active Ticket:{' '}
                  <Text style={{ color: '#F2994A' }}>
                    {room.activeTickets || 0}
                  </Text>
                </StandardText>
              </View>
              <StandardText
                style={{ marginLeft: 28, color: 'gray', marginTop: 4 }}
                size="sm"
              >
                {room.ticketMessage || 'Cupboard door needs fixing'}
              </StandardText>

              {/* Under Notice */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-alert"
                  size={22}
                  color="#000"
                />
                <StandardText
                  style={{ marginLeft: 6 }}
                  fontWeight="bold"
                  size="md"
                >
                  Under Notice:{' '}
                  <Text style={{ color: '#F2994A' }}>{room.room || 0}</Text>
                </StandardText>
              </View>
              <View style={{ marginLeft: 28, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* <Avatar.Image
                    size={24}
                    source={require('../assets/avatar-placeholder.png')} // Replace with real image if needed
                  /> */}
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={22}
                    color="#000"
                  />
                  <StandardText style={{ marginLeft: 8 }} size="sm">
                    Rihan Kapoor
                  </StandardText>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View>
          <StandardText fontWeight="bold" size="md" style={{ marginBottom: 8 }}>
            Amenities
          </StandardText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {(room.amenities
              ? room.amenities.split(',').map(item => item.trim())
              : ['WiFi', 'AC', 'Heater', 'Wardrobe', 'Attached Bathroom']
            ).map((item, idx) => (
              <Chip
                key={idx}
                style={{ backgroundColor: '#F0F0F0' }}
                textStyle={{ fontWeight: '500' }}
                icon="check"
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: '#E0E0E0',
            marginVertical: 10,
            marginHorizontal: 25,
            width: '70%',
            borderRadius: 5,
            alignSelf: 'center',
          }}
        />

        <StandardText fontWeight="bold" size="xl" style={{ marginBottom: 8 }}>
          List of Tenants
        </StandardText>

        {tenants.map(tenant => (
          <StandardCard key={tenant.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TenantDetails', { tenant })}
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
                          // Refetch tenants after deletion
                          const res = await getTenants(
                            credentials.accessToken,
                            credentials.property_id,
                            room.id,
                          );
                          setTenants(res.data);
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
                        name="alert-circle"
                        size={18}
                        color="#555"
                      />
                      <StandardText style={styles.detailText}>
                        Under Notice : {tenant.is_on_notice ? 'Yes' : 'No'}
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
                        name="alert-circle"
                        size={18}
                        color="#555"
                      />
                      <StandardText style={styles.detailText}>
                        {tenant.has_dues ? 'Dues' : 'No Dues'}
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

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={18}
                        color="#555"
                      />
                      <StandardText style={styles.detailText}>
                        Lease End: {tenant.check_out_date}
                      </StandardText>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </StandardCard>
        ))}

        <Gap size="xxl" />
      </ScrollView>
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
    bottom: 40,
    right: 30,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
});

export default RoomDetails;
