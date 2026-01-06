import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DocumentPicker from 'react-native-document-picker';
import { getIconName } from '../utils/iconMapping';
import { COLORS } from '../constants/colors';

const BulkPriceUpdate = ({ 
  navigation, 
  onBack,
  vendorProducts = [],
  onUpdatePrices 
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownloadTemplate = () => {
    // In a real app, this would download the Excel template
    // For now, show alert
    Alert.alert(
      'Download Template',
      'Template download will be available after backend integration. The template will include: Product ID, Product Name, Current Price, New Price, Category, Unit',
      [{ text: 'OK' }]
    );
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
        copyTo: 'cachesDirectory',
      });

      setFile(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Failed to pick file. Please try again.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setLoading(true);

    // Simulate upload process
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Price update file uploaded successfully! Prices will be updated after verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFile(null);
              if (onUpdatePrices) {
                onUpdatePrices();
              }
            }
          }
        ]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => {
              if (onBack) onBack();
              else if (navigation) navigation.goBack();
            }} 
            style={styles.backButton} 
            activeOpacity={0.7}
          >
            <Icon name={getIconName('ArrowLeft')} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bulk Price Update</Text>
          <TouchableOpacity 
            onPress={() => setShowInstructions(true)}
            style={styles.helpButton}
            activeOpacity={0.7}
          >
            <Icon name="help-circle" size={24} color={COLORS.orange} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Download Template Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="download" size={24} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>Download Template</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Download the Excel template with your current products. Fill in the "New Price" column and upload it back.
          </Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadTemplate}
            activeOpacity={0.8}
          >
            <Icon name="download" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Template</Text>
          </TouchableOpacity>
        </View>

        {/* Upload File Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="upload" size={24} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>Upload Excel File</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the Excel file with updated prices. Make sure the file follows the template format.
          </Text>

          {file ? (
            <View style={styles.fileInfo}>
              <View style={styles.fileInfoContent}>
                <Icon name="file" size={24} color={COLORS.orange} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setFile(null)}
                style={styles.removeButton}
              >
                <Icon name="x" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickFile}
              activeOpacity={0.8}
            >
              <Icon name="upload" size={24} color={COLORS.orange} />
              <Text style={styles.uploadButtonText}>Select Excel File</Text>
              <Text style={styles.uploadButtonSubtext}>.xlsx or .xls files only</Text>
            </TouchableOpacity>
          )}

          {file && (
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleUpload}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Upload & Update Prices</Text>
                  <Icon name="check-circle" size={20} color="#FFFFFF" style={styles.submitIcon} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={24} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Download the template Excel file</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Fill in the "New Price" column with updated prices</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Keep "Product ID" and other columns unchanged</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>Upload the completed file to update prices in bulk</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Instructions Modal */}
      <Modal
        visible={showInstructions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstructions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How to Use Bulk Price Update</Text>
              <TouchableOpacity
                onPress={() => setShowInstructions(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                • Download the template to get your current product list{'\n'}
                • Open the Excel file and update the "New Price" column{'\n'}
                • Do not modify Product ID, Product Name, or other columns{'\n'}
                • Save the file and upload it here{'\n'}
                • Prices will be updated after admin verification
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.orange,
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitIcon: {
    marginLeft: 4,
  },
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});

export default BulkPriceUpdate;
