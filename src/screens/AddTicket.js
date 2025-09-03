import React, {useState, useContext} from 'react';
import {View, StyleSheet, ScrollView, Image} from 'react-native';
import {
  TextInput as PaperInput,
  Button,
  useTheme,
  Text,
} from 'react-native-paper';
import {CredentialsContext} from '../context/CredentialsContext';
import {
  createDocument,
  createTicket,
  uploadDocument,
} from '../services/NetworkUtils';
import StandardText from '../components/StandardText/StandardText';
import Gap from '../components/Gap/Gap';
import * as ImagePicker from 'react-native-image-picker';

const AddTicket = ({navigation}) => {
  const theme = useTheme();
  const {credentials} = useContext(CredentialsContext);
  const [form, setForm] = useState({
    issue: '',
    description: '',
    raisedBy: '',
    roomId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roomImages, setRoomImages] = useState([]);

  const handleChange = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
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

      const payload = {
        ...form,
        propertyId: credentials.property_id,
        status: 'PENDING',
        roomId: parseInt(form.roomId, 10),
        image_document_id_list: imageDocumentIds,
      };
      await createTicket(credentials.accessToken, payload);
      setSuccess('Ticket created successfully!');
      setForm({issue: '', description: '', raisedBy: '', roomId: ''});
      navigation.goBack();
    } catch (err) {
      setError('Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 5,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setRoomImages(response.assets.slice(0, 5));
        }
      },
    );
  };

  const removeImage = index => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StandardText fontWeight="bold" size="xl" style={{marginBottom: 20}}>
        Create New Ticket
      </StandardText>
      <PaperInput
        label="Issue"
        value={form.issue}
        onChangeText={text => handleChange('issue', text)}
        style={styles.input}
      />
      <PaperInput
        label="Description"
        value={form.description}
        onChangeText={text => handleChange('description', text)}
        style={styles.input}
        multiline
      />
      <PaperInput
        label="Raised By"
        value={form.raisedBy}
        onChangeText={text => handleChange('raisedBy', text)}
        style={styles.input}
      />

      <PaperInput
        label="Room ID"
        value={form.roomId}
        onChangeText={text => handleChange('roomId', text)}
        style={styles.input}
      />

      <Gap size="sm" />
      <StandardText>Room Images (up to 5)</StandardText>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
        {roomImages.map((img, idx) => (
          <View
            key={idx}
            style={{position: 'relative', marginRight: 8, marginBottom: 8}}>
            {img.uri ? (
              <Image
                source={{uri: img.uri}}
                style={{width: 80, height: 80, borderRadius: 8}}
              />
            ) : null}
            <Button
              icon="close"
              compact
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                padding: 2,
                borderRadius: 20,
              }}
              onPress={() => removeImage(idx)}
            />
          </View>
        ))}
      </View>
      <Button
        icon="image"
        mode="outlined"
        onPress={pickImages}
        style={styles.uploadImageButton}>
        {roomImages.length > 0 ? 'Change Images' : 'Upload Images'}
      </Button>

      {error ? (
        <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
      ) : null}
      {success ? (
        <Text style={{color: 'green', marginBottom: 10}}>{success}</Text>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={{marginTop: 20}}>
        Create Ticket
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
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
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
    padding: 2,
    borderRadius: 20,
  },
});

export default AddTicket;
