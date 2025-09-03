import React, { useContext, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import Gap from '../components/Gap/Gap';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import { addTenant } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddTenant = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const { credentials } = useContext(CredentialsContext);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [datePicker, setDatePicker] = useState({
    field: '',
    show: false,
    value: new Date(),
  });

  const openDatePicker = field => {
    setDatePicker({
      field,
      show: true,
      value: tenant[field] ? new Date(tenant[field]) : new Date(),
    });
  };

  const formatDate = date => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setTenant({
        ...tenant,
        [datePicker.field]: formatDate(selectedDate),
      });
    }
    setDatePicker({ ...datePicker, show: false });
  };

  const [tenant, setTenant] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    lockInPeriod: '',
    agreementPeriod: '',
    tenantType: '',
    addRentOn: '',
  });

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!tenant.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!tenant.phone.trim() || tenant.phone.length !== 10) {
      errors.phone = 'Valid phone is required';
    }
    if (!tenant.email.trim() || !tenant.email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    if (!tenant.roomId.trim()) {
      errors.roomId = 'Room ID is required';
    }
    if (!tenant.checkInDate.trim()) {
      errors.checkInDate = 'Check-in date is required';
    }
    if (!tenant.checkOutDate.trim()) {
      errors.checkOutDate = 'Check-out date is required';
    }
    if (!tenant.lockInPeriod.trim() || isNaN(tenant.lockInPeriod)) {
      errors.lockInPeriod = 'Lock-in period is required';
    }
    if (!tenant.agreementPeriod.trim() || isNaN(tenant.agreementPeriod)) {
      errors.agreementPeriod = 'Agreement period is required';
    }
    if (!tenant.tenantType.trim()) {
      errors.tenantType = 'Tenant type is required';
    }
    if (!tenant.addRentOn.trim()) {
      errors.addRentOn = 'Rent start date is required';
    }
    return errors;
  };

  const handleChange = (key, value) => {
    setTenant({ ...tenant, [key]: value });
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please fill all mandatory fields correctly.');
      return;
    }
    setLoading(true);
    try {
      await addTenant(credentials.accessToken, credentials.property_id, tenant);
      navigation.goBack();
    } catch (error) {
      setErrorMsg(
        error?.message ||
          (typeof error === 'string'
            ? error
            : 'Failed to add tenant. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Gap size="md" />
          <StandardCard>
            <View style={styles.cardContent}>
              <MaterialCommunityIcons
                name="account-circle"
                size={100}
                color="#888"
              />

              <View style={{ flex: 1, marginLeft: 16 }}>
                <StandardText fontWeight="bold" size="xl">
                  Add New Tenant
                </StandardText>
              </View>
            </View>
          </StandardCard>
          <Gap size="md" />
          <TextInput
            label="Full Name *"
            value={tenant.name}
            onChangeText={text => handleChange('name', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Enter tenant's full name"
            error={!!formErrors.name}
          />
          {formErrors.name && (
            <Text style={styles.errorText}>{formErrors.name}</Text>
          )}
          <TextInput
            label="Phone Number *"
            value={tenant.phone}
            onChangeText={text => handleChange('phone', text)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="Primary phone number"
            maxLength={10}
            error={!!formErrors.phone}
          />
          {formErrors.phone && (
            <Text style={styles.errorText}>{formErrors.phone}</Text>
          )}
          <TextInput
            label="Alternate Phone Number"
            value={tenant.alternatePhone}
            onChangeText={text => handleChange('alternatePhone', text)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="Alternate phone number"
            maxLength={10}
          />
          <TextInput
            label="Email *"
            value={tenant.email}
            onChangeText={text => handleChange('email', text)}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
            placeholder="Tenant's email address"
            error={!!formErrors.email}
          />
          {formErrors.email && (
            <Text style={styles.errorText}>{formErrors.email}</Text>
          )}
          <TextInput
            label="Room ID *"
            value={tenant.roomId}
            onChangeText={text => handleChange('roomId', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Room ID or number"
            error={!!formErrors.roomId}
          />
          {formErrors.roomId && (
            <Text style={styles.errorText}>{formErrors.roomId}</Text>
          )}

          <TouchableOpacity onPress={() => openDatePicker('checkInDate')}>
            <TextInput
              label="Check-in Date (YYYY-MM-DD) *"
              value={tenant.checkInDate}
              mode="outlined"
              style={styles.input}
              editable={false}
              pointerEvents="none"
              placeholder="Select check-in date"
              error={!!formErrors.checkInDate}
            />
          </TouchableOpacity>
          {formErrors.checkInDate && (
            <Text style={styles.errorText}>{formErrors.checkInDate}</Text>
          )}

          <TouchableOpacity onPress={() => openDatePicker('checkOutDate')}>
            <TextInput
              label="Check-out Date (YYYY-MM-DD) *"
              value={tenant.checkOutDate}
              mode="outlined"
              style={styles.input}
              editable={false}
              pointerEvents="none"
              placeholder="Select check-out date"
              error={!!formErrors.checkOutDate}
            />
          </TouchableOpacity>
          {formErrors.checkOutDate && (
            <Text style={styles.errorText}>{formErrors.checkOutDate}</Text>
          )}

          <TextInput
            label="Lock-in Period (months) *"
            value={tenant.lockInPeriod}
            onChangeText={text => handleChange('lockInPeriod', text)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 6"
            error={!!formErrors.lockInPeriod}
          />
          {formErrors.lockInPeriod && (
            <Text style={styles.errorText}>{formErrors.lockInPeriod}</Text>
          )}
          <TextInput
            label="Agreement Period (months) *"
            value={tenant.agreementPeriod}
            onChangeText={text => handleChange('agreementPeriod', text)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 12"
            error={!!formErrors.agreementPeriod}
          />
          {formErrors.agreementPeriod && (
            <Text style={styles.errorText}>{formErrors.agreementPeriod}</Text>
          )}

          <Text style={{ marginBottom: 8, marginLeft: 2 }}>Tenant Type *</Text>
          <View
            style={{
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
            }}
          >
            <Picker
              selectedValue={tenant.tenantType}
              onValueChange={value => handleChange('tenantType', value)}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Family" value="family" />
              <Picker.Item label="Bachelors" value="bachelors" />
            </Picker>
          </View>
          {formErrors.tenantType && (
            <Text style={styles.errorText}>{formErrors.tenantType}</Text>
          )}
          <TouchableOpacity onPress={() => openDatePicker('addRentOn')}>
            <TextInput
              label="Add Rent On (Starting Date) *"
              value={tenant.addRentOn}
              mode="outlined"
              style={styles.input}
              editable={false}
              pointerEvents="none"
              placeholder="Select rent start date"
              error={!!formErrors.addRentOn}
            />
          </TouchableOpacity>
          {formErrors.addRentOn && (
            <Text style={styles.errorText}>{formErrors.addRentOn}</Text>
          )}
          {datePicker.show && (
            <DateTimePicker
              value={datePicker.value}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

          <Gap size="lg" />
          {loading ? (
            <ActivityIndicator
              animating={true}
              size="large"
              style={{ marginVertical: 16 }}
            />
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{ borderRadius: 5 }}
            >
              <StandardText fontWeight="bold" color="default_white">
                Save Tenant
              </StandardText>
            </Button>
          )}
          <Gap size="xxl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorMsg: {
    color: 'red',
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default AddTenant;
