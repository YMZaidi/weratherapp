import React, { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, push, set } from 'firebase/database';
import { database, auth } from '../config/firebase';

export default function CameraPage() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    }
  }

  const saveToJournal = async () => {
    if (!photo) return;

    try {
      const userId = auth.currentUser.uid;
      const journalRef = ref(database, `users/${userId}/journal`);
      const newEntryRef = push(journalRef); // Creates a new unique key

      const entry = {
        id: newEntryRef.key,
        photoUri: photo,
        note,
        date: new Date().toISOString(),
      };

      await set(newEntryRef, entry);
      
      // Reset states and navigate
      setPhoto(null);
      setNote('');
      setShowNoteInput(false);
      navigation.navigate('Journal');
    } catch (error) {
      console.error('Error saving to journal:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {photo && (
        <View style={styles.photoContainer}>
          <Text style={styles.text}>Photo Taken:</Text>
          <Image source={{ uri: photo }} style={styles.photo} />
          {!showNoteInput ? (
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowNoteInput(true)}
            >
              <Text style={styles.text}>Add to Journal</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noteContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note about the weather..."
                placeholderTextColor="#999"
                value={note}
                onChangeText={setNote}
                multiline
              />
              <TouchableOpacity 
                style={styles.button} 
                onPress={saveToJournal}
              >
                <Text style={styles.text}>Save to Journal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  button: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  photoContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
  },
  photo: {
    width: 300,
    height: 400,
    marginTop: 10,
    borderRadius: 10,
  },
  noteContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
  },
  noteInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    color: '#000',
    minHeight: 100,
  },
});
