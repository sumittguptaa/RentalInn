import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import {
  Button,
  Checkbox,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CredentialsContext } from '../context/CredentialsContext';
import {
  createRoom,
  uploadDocument,
  createDocument,
  updateRoom,
} from '../services/NetworkUtils';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import colors from '../theme/color';
import StandardText from '../components/StandardText/StandardText';
import * as ImagePicker from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../context/ThemeContext';

const AddRoomSchema = Yup.object().shape({
  roomName: Yup.string().required('Room name is required'),
  areaType: Yup.string().required('Area type is required'),
  floorNumber: Yup.number()
    .typeError('Floor number must be a number')
    .integer('Floor number must be an integer')
    .required('Floor number is required'),
  rentAmount: Yup.number()
    .typeError('Rent must be a number')
    .positive('Rent must be positive')
    .required('Rent is required'),
  securityAmount: Yup.number()
    .typeError('Security amount must be a number')
    .min(0, 'Security amount cannot be negative')
    .required('Security amount is required'),
  bedCount: Yup.number()
    .typeError('Bed count must be a number')
    .integer('Bed count must be an integer')
    .min(0, 'Bed count cannot be negative')
    .required('Bed count is required'),
  bathroomCount: Yup.number()
    .typeError('Bathroom count must be a number')
    .integer('Bathroom count must be an integer')
    .min(0, 'Bathroom count cannot be negative')
    .required('Bathroom count is required'),
  amenities: Yup.string(),
  furnished: Yup.boolean(),
  available: Yup.boolean(),
  lastElectricityReading: Yup.number()
    .typeError('Last electricity reading must be a number')
    .min(0, 'Reading cannot be negative')
    .required('Last electricity reading is required'),
  lastElectricityReadingDate: Yup.string().required(
    'Last electricity reading date is required',
  ),
});

const AddRoom = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get params from navigation
  const route =
    navigation && navigation.getState
      ? navigation.getState().routes.find(r => r.name === 'AddRoom')
      : null;
  const params =
    route && route.params
      ? route.params
      : navigation && navigation.params
      ? navigation.params
      : {};
  const isEdit = params && params.isEdit;
  const editRoom = params && params.room;

  const [datePicker, setDatePicker] = useState({
    show: false,
    value: new Date(),
  });

  // Helper to format date as YYYY-MM-DD
  const formatDate = date => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Open calendar for last electricity reading date
  const openDatePicker = currentValue => {
    setDatePicker({
      show: true,
      value: currentValue ? new Date(currentValue) : new Date(),
    });
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate, setFieldValue) => {
    if (event.type === 'set' && selectedDate) {
      setFieldValue('lastElectricityReadingDate', formatDate(selectedDate));
    }
    setDatePicker(prev => ({ ...prev, show: false }));
  };

  const initialValues = {
    roomName: isEdit && editRoom ? editRoom.name || '' : '',
    areaType: isEdit && editRoom ? editRoom.areaType || '' : '',
    floorNumber:
      isEdit && editRoom ? editRoom.floorNumber?.toString() || '' : '',
    rentAmount: isEdit && editRoom ? editRoom.rentAmount?.toString() || '' : '',
    securityAmount:
      isEdit && editRoom ? editRoom.securityAmount?.toString() || '' : '',
    bedCount:
      isEdit && editRoom
        ? editRoom.totalBeds?.toString() || editRoom.bedCount?.toString() || ''
        : '',
    bathroomCount:
      isEdit && editRoom ? editRoom.bathroomCount?.toString() || '' : '',
    amenities: isEdit && editRoom ? editRoom.amenities || '' : '',
    furnished: isEdit && editRoom ? !!editRoom.furnished : false,
    available: isEdit && editRoom ? !!editRoom.isAvailable : true,
    lastElectricityReading:
      isEdit && editRoom
        ? editRoom.lastElectricityReading?.toString() || ''
        : '',
    lastElectricityReadingDate:
      isEdit && editRoom ? editRoom.lastElectricityReadingDate || '' : '',
  };

  const [roomImages, setRoomImages] = useState([]);

  // Pre-fill images if editing
  useEffect(() => {
    if (
      isEdit &&
      editRoom &&
      editRoom.image_document_id_list &&
      Array.isArray(editRoom.image_document_id_list)
    ) {
      // You may want to fetch image URLs here if needed
      // For now, just set empty array (or fetch URLs if you have API)
      setRoomImages([]);
    }
  }, [isEdit, editRoom]);

  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 5,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setRoomImages(
            prev => [...prev, ...response.assets].slice(0, 5), // store full asset, not just uri
          );
        }
      },
    );
  };

  const removeImage = index => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRoom = async (values, { resetForm }) => {
    setLoading(true);
    setError('');

    try {
      const imageDocumentIds = [];
      for (const image of roomImages) {
        const imagedetails = {
          file_name: image.fileName || image.uri.split('/').pop(),
          file_type: image.type,
          descriptor: 'Room Image',
          is_signature_required: false,
          doc_type: 'Room image',
        };
        const room_document_res = await createDocument(
          credentials.accessToken,
          credentials.property_id,
          imagedetails,
        );
        await uploadDocument(room_document_res.data.upload_url, image);
        imageDocumentIds.push(room_document_res.data.document_id);
      }

      const roomData = {
        ...values,
        roomName: values.roomName.trim(),
        rentAmount: parseFloat(values.rentAmount),
        securityAmount: parseFloat(values.securityAmount, 10),
        floorNumber: parseInt(values.floorNumber, 10),
        bedCount: parseInt(values.bedCount, 10),
        bathroomCount: parseInt(values.bathroomCount, 10),
        lastElectricityReading: parseFloat(values.lastElectricityReading, 10),
        image_document_id_list: imageDocumentIds,
      };

      if (isEdit && editRoom) {
        await updateRoom(
          credentials.accessToken,
          credentials.property_id,
          editRoom.id,
          roomData,
        );
      } else {
        await createRoom(
          credentials.accessToken,
          credentials.property_id,
          roomData,
        );
      }

      resetForm();
      navigation.goBack({ refresh: true });
    } catch (err) {
      console.error(
        isEdit ? 'Failed to update room:' : 'Failed to add room:',
        err,
      );

      let errorMessage = isEdit
        ? 'Failed to update room. Please try again.'
        : 'Failed to add room. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage =
          typeof err.response.data.message === 'string'
            ? err.response.data.message
            : err.response.data.message.join(', ');
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <StandardCard>
          <Text style={styles.heading}>
            {isEdit ? 'Edit Room' : 'Add New Room'}
          </Text>
          <Divider style={styles.divider} />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Formik
            initialValues={initialValues}
            validationSchema={AddRoomSchema}
            onSubmit={handleAddRoom}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View>
                <TextInput
                  label="Room Name *"
                  value={values.roomName}
                  onChangeText={handleChange('roomName')}
                  onBlur={handleBlur('roomName')}
                  error={touched.roomName && errors.roomName}
                  style={styles.input}
                  mode="outlined"
                />
                {touched.roomName && errors.roomName && (
                  <HelperText type="error">{errors.roomName}</HelperText>
                )}

                <Text style={styles.areaTypeLabel}>Area Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.areaType}
                    onValueChange={value => setFieldValue('areaType', value)}
                    style={[
                      styles.picker,
                      { color: mode === 'dark' ? '#e0e0e0' : '#000' },
                    ]}
                    dropdownIconColor={mode === 'dark' ? '#e0e0e0' : '#000'}
                  >
                    <Picker.Item
                      label="Select Area Type"
                      value=""
                      color={mode === 'dark' ? '#b0b0b0' : '#888'}
                    />
                    <Picker.Item
                      label="BHK"
                      value="BHK"
                      color={mode === 'dark' ? '#e0e0e0' : '#000'}
                    />
                    <Picker.Item
                      label="RK"
                      value="RK"
                      color={mode === 'dark' ? '#e0e0e0' : '#000'}
                    />
                  </Picker>
                </View>
                {touched.areaType && errors.areaType && (
                  <HelperText type="error">{errors.areaType}</HelperText>
                )}

                <TextInput
                  label="Floor Number *"
                  value={values.floorNumber.toString()}
                  onChangeText={handleChange('floorNumber')}
                  onBlur={handleBlur('floorNumber')}
                  error={touched.floorNumber && errors.floorNumber}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.floorNumber && errors.floorNumber && (
                  <HelperText type="error">{errors.floorNumber}</HelperText>
                )}

                <TextInput
                  label="Rent (INR) *"
                  value={values.rentAmount.toString()}
                  onChangeText={handleChange('rentAmount')}
                  onBlur={handleBlur('rentAmount')}
                  error={touched.rentAmount && errors.rentAmount}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.rentAmount && errors.rentAmount && (
                  <HelperText type="error">{errors.rentAmount}</HelperText>
                )}

                <TextInput
                  label="Security Amount (INR) *"
                  value={values.securityAmount.toString()}
                  onChangeText={handleChange('securityAmount')}
                  onBlur={handleBlur('securityAmount')}
                  error={touched.securityAmount && errors.securityAmount}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.securityAmount && errors.securityAmount && (
                  <HelperText type="error">{errors.securityAmount}</HelperText>
                )}

                <TextInput
                  label="Bed Count *"
                  value={values.bedCount.toString()}
                  onChangeText={handleChange('bedCount')}
                  onBlur={handleBlur('bedCount')}
                  error={touched.bedCount && errors.bedCount}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.bedCount && errors.bedCount && (
                  <HelperText type="error">{errors.bedCount}</HelperText>
                )}

                <TextInput
                  label="Bathroom Count *"
                  value={values.bathroomCount.toString()}
                  onChangeText={handleChange('bathroomCount')}
                  onBlur={handleBlur('bathroomCount')}
                  error={touched.bathroomCount && errors.bathroomCount}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.bathroomCount && errors.bathroomCount && (
                  <HelperText type="error">{errors.bathroomCount}</HelperText>
                )}

                <TextInput
                  label="Amenities"
                  value={values.amenities}
                  onChangeText={handleChange('amenities')}
                  onBlur={handleBlur('amenities')}
                  placeholder="e.g., WiFi, AC, Water Heater (separate by commas)"
                  style={styles.input}
                  mode="outlined"
                />

                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={values.furnished ? 'checked' : 'unchecked'}
                    onPress={() =>
                      setFieldValue('furnished', !values.furnished)
                    }
                    color={colors.primary}
                  />
                  <Text style={styles.checkboxLabel}>Furnished</Text>
                </View>

                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={values.available ? 'checked' : 'unchecked'}
                    onPress={() =>
                      setFieldValue('available', !values.available)
                    }
                    color={colors.primary}
                  />
                  <Text style={styles.checkboxLabel}>Available</Text>
                </View>

                <TextInput
                  label="Last Electricity Reading *"
                  value={values.lastElectricityReading.toString()}
                  onChangeText={handleChange('lastElectricityReading')}
                  onBlur={handleBlur('lastElectricityReading')}
                  error={
                    touched.lastElectricityReading &&
                    errors.lastElectricityReading
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />
                {touched.lastElectricityReading &&
                  errors.lastElectricityReading && (
                    <HelperText type="error">
                      {errors.lastElectricityReading}
                    </HelperText>
                  )}
                <TouchableOpacity onPress={() => openDatePicker('addRentOn')}>
                  <TextInput
                    label="Last Electricity Reading Date * (YYYY-MM-DD)"
                    value={values.lastElectricityReadingDate}
                    onChangeText={handleChange('lastElectricityReadingDate')}
                    onBlur={handleBlur('lastElectricityReadingDate')}
                    error={
                      touched.lastElectricityReadingDate &&
                      errors.lastElectricityReadingDate
                    }
                    style={styles.input}
                    mode="outlined"
                    placeholder="e.g. 2025-08-29"
                    editable={false}
                  />
                  {/* Open calendar on touch */}
                  <View style={styles.absoluteFill}>
                    <TouchableOpacity
                      style={styles.flexOne}
                      activeOpacity={1}
                      onPress={() =>
                        openDatePicker(values.lastElectricityReadingDate)
                      }
                    >
                      <View style={styles.flexOne} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {datePicker.show && (
                  <DateTimePicker
                    value={datePicker.value}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) =>
                      onDateChange(event, selectedDate, setFieldValue)
                    }
                  />
                )}
                {touched.lastElectricityReadingDate &&
                  errors.lastElectricityReadingDate && (
                    <HelperText type="error">
                      {errors.lastElectricityReadingDate}
                    </HelperText>
                  )}

                <Gap size="sm" />
                <StandardText>Room Images (up to 5)</StandardText>
                <View style={styles.imagePreviewContainer}>
                  {roomImages.map((img, idx) => (
                    <View key={idx} style={styles.roomImageWrapper}>
                      <Image
                        source={{ uri: img.uri }}
                        style={styles.roomImage}
                      />
                      <Button
                        icon="close"
                        compact
                        style={styles.removeImageButton}
                        onPress={() => removeImage(idx)}
                      />
                    </View>
                  ))}
                </View>
                <Button
                  icon="image"
                  mode="outlined"
                  onPress={pickImages}
                  style={styles.uploadImageButton}
                >
                  {roomImages.length > 0 ? 'Change Images' : 'Upload Images'}
                </Button>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  {isEdit ? 'Update Room' : 'Add Room'}
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </View>
            )}
          </Formik>
        </StandardCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
  },
  scrollView: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  button: {
    marginVertical: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    imageWrapper: {
      position: 'relative',
      width: '48%',
      marginBottom: 10,
    },
    roomImageWrapper: {
      position: 'relative',
      marginRight: 8,
      marginBottom: 8,
    },
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 2,
    removeImageButton: {
      position: 'absolute',
      top: -10,
      right: -10,
      zIndex: 1,
      padding: 2,
      borderRadius: 20,
    },
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  areaTypeLabel: {
    marginBottom: 4,
  },
  flexOne: {
    flex: 1,
  },
  uploadImageButton: {
    marginBottom: 10,
  },
  roomImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
});

export default AddRoom;
