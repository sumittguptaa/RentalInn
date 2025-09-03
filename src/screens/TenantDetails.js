import React, { useContext, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import StandardInformationAccordion from '../components/StandardInformationAccordion/StandardInformationAccordion';
import colors from '../theme/color';
import { deleteTenant, putTenantOnNotice } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const TenantDetails = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant } = route.params;

  const [activeMenu, setActiveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const anchorRef = useRef(null);

  const openMenu = () => {
    if (!anchorRef.current || !anchorRef.current.measureInWindow) {
      setMenuPosition({ x: screenWidth / 2 - 80, y: 200, width: 0, height: 0 });
      setActiveMenu(true);
      return;
    }
    anchorRef.current.measureInWindow((x, y, width, height) => {
      setMenuPosition({ x, y, width, height });
      setActiveMenu(true);
    });
  };

  const closeMenu = () => {
    setActiveMenu(false);
    setMenuPosition(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Gap size="xxl" />

      {/* Header Banner */}
      <View
        style={{ height: 200, width: '100%', backgroundColor: colors.primary }}
      />

      {/* Profile Card */}
      <View style={{ paddingHorizontal: 15, marginTop: -140 }}>
        <StandardCard style={{ padding: 16, borderRadius: 16, elevation: 3 }}>
          {/* Header Row: Avatar + Name + Menu */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="account-circle"
              size={64}
              color="#666"
              style={{ marginRight: 12 }}
            />

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <StandardText fontWeight="bold" size="xl">
                  {tenant.name}
                </StandardText>

                {/* Custom Menu Anchor */}
                <TouchableOpacity
                  ref={anchorRef}
                  onPress={openMenu}
                  style={{ padding: 6 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {/* Status Chip */}
              <Chip
                style={{
                  marginTop: 4,
                  alignSelf: 'flex-start',
                  backgroundColor: tenant.is_on_notice ? '#FFF3E0' : '#E8F5E9',
                }}
                textStyle={{
                  color: tenant.is_on_notice ? '#E65100' : '#2E7D32',
                  fontWeight: '600',
                }}
              >
                {tenant.is_on_notice ? 'On Notice' : 'Active'}
              </Chip>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: '#EEE',
              marginVertical: 12,
            }}
          />

          {/* Contact Info */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
            <DetailRow
              icon="phone"
              label="Mobile"
              value={tenant.phone_number}
            />
            <DetailRow
              icon="email"
              label="Email"
              value={tenant.email || 'N/A'}
            />
            <DetailRow
              icon="calendar"
              label="Joined"
              value={tenant.check_in_date}
            />
          </View>
        </StandardCard>
      </View>

      <View style={styles.divider} />
      <ScrollView style={{ paddingHorizontal: 15, paddingTop: 10 }}>
        {/* Room & Rent Details */}
        <StandardInformationAccordion
          icon={'home'}
          heading="Room & Rent Details"
          content={
            <View>
              <DetailRow label="Room" value={tenant.room?.name} />
              <DetailRow label="Rent Amount" value={`₹${tenant.rent_amount}`} />
              <DetailRow
                label="Deposit"
                value={`₹${tenant.room.securityAmount || 'N/A'}`}
              />
              <DetailRow
                label="Rent Due"
                value={tenant.rent_due_date || 'No Dues'}
              />
              <DetailRow
                label="Lease End"
                value={tenant.check_out_date || 'N/A'}
              />
            </View>
          }
        />

        <Gap size="md" />

        {/* Family & Emergency */}
        <StandardInformationAccordion
          icon={'account-group'}
          heading="Family & Emergency Contacts"
          content={
            <View>
              {tenant.emergency_contact && (
                <DetailRow
                  label="Emergency Contact"
                  value={`${tenant.emergency_contact.name} (${tenant.emergency_contact.phone})`}
                />
              )}
              {tenant.guardian && (
                <DetailRow
                  label="Guardian"
                  value={`${tenant.guardian.name} (${tenant.guardian.phone})`}
                />
              )}
            </View>
          }
        />

        <Gap size="md" />

        {/* Payment History */}
        <StandardInformationAccordion
          icon={'credit-card'}
          heading="Payment History"
          content={
            <View>
              {tenant.payments && tenant.payments.length > 0 ? (
                tenant.payments
                  .slice(0, 3)
                  .map((p, idx) => (
                    <DetailRow
                      key={idx}
                      label={`${p.date}`}
                      value={`₹${p.amount} (${p.status})`}
                    />
                  ))
              ) : (
                <StandardText>No payments recorded</StandardText>
              )}
            </View>
          }
        />

        <Gap size="md" />

        {/* KYC Documents */}
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <StandardText fontWeight="bold" size="lg">
              KYC Documents
            </StandardText>
            <Chip style={styles.verifiedChip} textStyle={{ color: 'green' }}>
              {tenant.kyc_verified ? 'Verified' : 'Pending'}
            </Chip>
          </View>

          <View style={styles.cardRow}>
            {tenant.kyc_docs?.map((doc, idx) => (
              <View key={idx} style={styles.card}>
                <Image
                  source={{ uri: doc.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={{ padding: 5 }}>
                  <StandardText size="sm" fontWeight="bold">
                    {doc.type}
                  </StandardText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Gap size="md" />

        {/* Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            mode="outlined"
            textColor={colors.black}
            style={{ width: '45%', borderRadius: 5 }}
          >
            <StandardText fontWeight="bold">Edit</StandardText>
          </Button>
          <Button mode="contained" style={{ width: '45%', borderRadius: 5 }}>
            <StandardText fontWeight="bold" color="default_white">
              Record Payment
            </StandardText>
          </Button>
        </View>

        <Gap size="xxl" />
      </ScrollView>

      {/* CUSTOM MENU OVERLAY */}
      {activeMenu && menuPosition && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View
            style={[
              styles.popup,
              {
                top: menuPosition.y + menuPosition.height + 6,
                left: Math.max(8, Math.min(menuPosition.x, screenWidth - 180)),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                navigation.navigate('EditTenant', { tenantId: tenant.id });
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color="#555"
                style={{ marginRight: 10 }}
              />
              <StandardText>Edit</StandardText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color="#555"
                style={{ marginRight: 10 }}
              />
              <StandardText>Share</StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await putTenantOnNotice(credentials.accessToken, tenant.id, {
                  notice: true,
                });
                closeMenu();
              }}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color="#e53935"
                style={{ marginRight: 10 }}
              />
              <StandardText>Put on Notice</StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await deleteTenant(credentials.accessToken, tenant.id);
                closeMenu();
                navigation.goBack();
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#e53935"
                style={{ marginRight: 10 }}
              />
              <StandardText>Delete</StandardText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Small reusable row component
const DetailRow = ({ icon, label, value, isMultiline }) => (
  <View
    style={[
      styles.row,
      isMultiline && { flexDirection: 'column', alignItems: 'flex-start' },
    ]}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color="#333"
          style={{ marginRight: 6 }}
        />
      )}
      <StandardText fontWeight="bold">{label}:</StandardText>
    </View>
    <StandardText
      style={{
        marginLeft: isMultiline ? 0 : 6,
        flexShrink: 1,
        flexWrap: 'wrap',
      }}
    >
      {value}
    </StandardText>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifiedChip: { backgroundColor: '#E8F5E9', borderRadius: 12 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: screenWidth / 2 - 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 10,
  },
  image: { width: '100%', height: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    marginHorizontal: 25,
    width: '70%',
    borderRadius: 5,
    alignSelf: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popup: {
    position: 'absolute',
    minWidth: 160,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TenantDetails;
