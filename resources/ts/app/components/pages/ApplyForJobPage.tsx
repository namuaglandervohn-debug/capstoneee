import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Container,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';

import {
  Send,
  TaskAlt,
  ContentCopy,
  Add,
  Delete,
  UploadFile,
} from '@mui/icons-material';

import AuthBackground from '../AuthBackground';
import { POSITIONS } from '../../lib/constants';
import { copyToClipboard } from '../../lib/copyToClipboard';
import { saveApplicationFiles } from '../../lib/localDb';
import { supabase } from '../../lib/supabaseClient';

const CIVIL_STATUS = ['Single', 'Married', 'Widowed', 'Separated'];
const GENDER = ['Male', 'Female', 'Prefer not to say'];
const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

const EDUCATIONAL_ATTAINMENT = [
  'Elementary',
  'Junior High School',
  'Senior High School',
  'College / Vocational',
  'Postgraduate',
];

const HEAR_ABOUT_OPTIONS = ['Facebook', 'Referral', 'Walk-in', 'Job Posting', 'Other'];

const COUNTRIES = [
  'Philippines', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
  'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Brunei',
  'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador',
  'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Laos', 'Latvia',
  'Lebanon', 'Libya', 'Lithuania', 'Malaysia', 'Mexico', 'Mongolia', 'Morocco', 'Myanmar', 'Nepal',
  'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam',
];

const NATIONALITIES = [
  'Filipino', 'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentinian',
  'Armenian', 'Australian', 'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi',
  'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian',
  'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Cambodian', 'Cameroonian', 'Canadian', 'Chilean',
  'Chinese', 'Colombian', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech',
  'Danish', 'Dominican', 'Dutch', 'Ecuadorian', 'Egyptian', 'Emirati', 'Estonian', 'Ethiopian',
  'Finnish', 'French', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan', 'Honduran',
  'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian',
  'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan', 'Korean', 'Kuwaiti', 'Laotian', 'Latvian',
  'Lebanese', 'Libyan', 'Lithuanian', 'Malaysian', 'Mexican', 'Mongolian', 'Moroccan', 'Myanmar',
  'Nepalese', 'New Zealander', 'Nigerian', 'Norwegian', 'Omani', 'Pakistani', 'Palestinian',
  'Panamanian', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian',
  'Saudi', 'Singaporean', 'South African', 'Spanish', 'Sri Lankan', 'Swedish', 'Swiss', 'Taiwanese',
  'Thai', 'Turkish', 'Ukrainian', 'Uruguayan', 'Venezuelan', 'Vietnamese',
];

const PH_PROVINCES_BY_REGION: Record<string, string[]> = {
  'National Capital Region (NCR)': ['Metro Manila'],
  'Cordillera Administrative Region (CAR)': ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  'Region I - Ilocos Region': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II - Cagayan Valley': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III - Central Luzon': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A - CALABARZON': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'MIMAROPA Region': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V - Bicol Region': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI - Western Visayas': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  'Region VII - Central Visayas': ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  'Region VIII - Eastern Visayas': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX - Zamboanga Peninsula': ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X - Northern Mindanao': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI - Davao Region': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII - SOCCSKSARGEN': ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  'Region XIII - Caraga': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)': ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi'],
};

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Metro Manila': ['Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela', 'Pateros'],
  'Davao del Norte': ['Panabo City', 'Tagum City', 'Samal City', 'Asuncion', 'Braulio E. Dujali', 'Carmen', 'Kapalong', 'New Corella', 'San Isidro', 'Santo Tomas', 'Talaingod'],
  'Davao del Sur': ['Davao City', 'Digos City', 'Bansalan', 'Hagonoy', 'Kiblawan', 'Magsaysay', 'Malalag', 'Matanao', 'Padada', 'Santa Cruz', 'Sulop'],
  'Davao Oriental': ['Mati City', 'Baganga', 'Banaybanay', 'Boston', 'Caraga', 'Cateel', 'Governor Generoso', 'Lupon', 'Manay', 'San Isidro', 'Tarragona'],
  'Davao de Oro': ['Nabunturan', 'Monkayo', 'Mawab', 'Maco', 'Maragusan', 'Laak', 'Compostela', 'Montevista', 'New Bataan', 'Pantukan'],
  'Davao Occidental': ['Malita', 'Don Marcelino', 'Jose Abad Santos', 'Santa Maria', 'Sarangani'],
  'Cotabato': ['Kidapawan City', 'Alamada', 'Aleosan', 'Antipas', 'Arakan', 'Banisilan', 'Carmen', 'Kabacan', 'Libungan', 'Matalam', 'Midsayap', 'Pigcawayan', 'Pikit', 'President Roxas', 'Tulunan'],
  'South Cotabato': ['Koronadal City', 'General Santos City', 'Polomolok', 'Tupi', 'Tampakan', 'Surallah', 'Tboli', 'Lake Sebu', 'Norala', 'Banga', 'Sto. Niño'],
  'Sarangani': ['Alabel', 'Glan', 'Kiamba', 'Maasim', 'Maitum', 'Malapatan', 'Malungon'],
  'Sultan Kudarat': ['Isulan', 'Tacurong City', 'Bagumbayan', 'Columbio', 'Esperanza', 'Kalamansig', 'Lambayong', 'Lebak', 'Lutayan', 'Palimbang', 'President Quirino', 'Senator Ninoy Aquino'],
  'Cebu': ['Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Danao City', 'Toledo City', 'Carcar City', 'Naga City'],
  'Iloilo': ['Iloilo City', 'Passi City', 'Oton', 'Pavia', 'Santa Barbara', 'Miagao', 'Pototan'],
  'Cavite': ['Bacoor City', 'Cavite City', 'Dasmariñas City', 'General Trias City', 'Imus City', 'Tagaytay City', 'Trece Martires City'],
  'Laguna': ['Calamba City', 'San Pablo City', 'Santa Rosa City', 'Biñan City', 'Cabuyao City', 'Los Baños', 'Pagsanjan'],
  'Batangas': ['Batangas City', 'Lipa City', 'Tanauan City', 'Santo Tomas City', 'Nasugbu', 'Lemery'],
  'Pampanga': ['Angeles City', 'San Fernando City', 'Mabalacat City', 'Apalit', 'Guagua', 'Lubao', 'Mexico'],
  'Bulacan': ['Malolos City', 'Meycauayan City', 'San Jose del Monte City', 'Baliuag', 'Bocaue', 'Marilao', 'Plaridel'],
};

const ZIP_BY_CITY: Record<string, string> = {
  'Panabo City': '8105', 'Tagum City': '8100', 'Samal City': '8119', 'Davao City': '8000', 'Digos City': '8002', 'Mati City': '8200',
  'Nabunturan': '8800', 'Malita': '8012', 'Kidapawan City': '9400', 'Koronadal City': '9506', 'General Santos City': '9500',
  'Alabel': '9501', 'Isulan': '9805', 'Tacurong City': '9800', 'Cebu City': '6000', 'Mandaue City': '6014', 'Lapu-Lapu City': '6015',
  'Iloilo City': '5000', 'Bacoor City': '4102', 'Dasmariñas City': '4114', 'Imus City': '4103', 'Calamba City': '4027',
  'Santa Rosa City': '4026', 'Batangas City': '4200', 'Lipa City': '4217', 'Angeles City': '2009', 'San Fernando City': '2000',
  'Malolos City': '3000', 'Quezon City': '1100', 'Manila': '1000', 'Makati': '1200', 'Taguig': '1630', 'Pasig': '1600',
};

const BARANGAYS_BY_CITY: Record<string, string[]> = {
  'Panabo City': ['A.O. Floirendo', 'Buenavista', 'Cacao', 'Cagangohan', 'Consolacion', 'Dapco', 'Gredu', 'J.P. Laurel', 'Kasilak', 'Katipunan', 'Katualan', 'Kauswagan', 'Kiotoy', 'Little Panay', 'Lower Panaga', 'Mabunao', 'Maduao', 'Malativas', 'Manay', 'Nanyo', 'New Malaga', 'New Malitbog', 'New Pandan', 'New Visayas', 'Quezon', 'Salvacion', 'San Francisco', 'San Nicolas', 'San Pedro', 'San Roque', 'San Vicente', 'Santa Cruz', 'Santo Niño', 'Sindaton', 'Southern Davao', 'Tagpore', 'Tibungol', 'Upper Licanan', 'Waterfall'],
  'Davao City': ['Agdao', 'Baguio Proper', 'Buhangin', 'Calinan', 'Catalunan Grande', 'Matina Crossing', 'Mintal', 'Poblacion', 'Sasa', 'Talomo Proper', 'Toril'],
  'Tagum City': ['Apokon', 'Magugpo East', 'Magugpo North', 'Magugpo Poblacion', 'Magugpo South', 'Magugpo West', 'Mankilam', 'Visayan Village'],
  'Mati City': ['Central', 'Dahican', 'Don Enrique Lopez', 'Sainz', 'Tamisan'],
};

const RELATIONSHIPS = ['Parent', 'Mother', 'Father', 'Spouse', 'Sibling', 'Brother', 'Sister', 'Child', 'Relative', 'Guardian', 'Friend', 'Neighbor', 'Partner', 'Cousin', 'Aunt', 'Uncle', 'Grandparent', 'Other'];

const SKILLS = ['Communication Skills', 'Customer Service', 'Computer Literacy', 'Leadership', 'Time Management', 'Teamwork', 'Problem-Solving', 'Cash Handling', 'Food and Beverage Service', 'Housekeeping', 'Administrative Work'];

const REQUIRED_DOCUMENTS = ['Resume/Biodata', 'Application Letter', 'Valid ID', 'Birth Certificate', 'Transcript of Records/Diploma', 'Certificate of Employment', 'Training Certificates', 'NBI/Police Clearance', 'Barangay Clearance', 'Medical Certificate'];

const steps = ['Position', 'Personal', 'Education & Work', 'Skills', 'References', 'Documents'];

type CharacterReference = { name: string; position: string; company: string; contact: string };

const EMPTY = {
  position: '', hearAbout: '', hearAboutOther: '',
  firstName: '', middleName: '', lastName: '', suffix: '', birthdate: '', age: '', gender: '', civilStatus: '', nationality: '', contactNumber: '', email: '',
  currentCountry: 'Philippines', currentRegion: '', currentProvince: '', currentCity: '', currentBarangay: '', currentStreet: '', currentZipCode: '', currentAddress: '',
  permanentCountry: 'Philippines', permanentRegion: '', permanentProvince: '', permanentCity: '', permanentBarangay: '', permanentStreet: '', permanentZipCode: '', permanentAddress: '',
  emergencyContactName: '', emergencyContactRelation: '', emergencyContactRelationOther: '', emergencyContactPhone: '', emergencyContactAddress: '',
  education: '', schoolName: '', courseProgram: '', yearGraduated: '', honorsAwards: '',
  companyOrganization: '', positionHeld: '', employmentStartDate: '', employmentEndDate: '', employmentPeriod: '', dutiesResponsibilities: '', reasonForLeaving: '', totalYearsExperience: '', previousSupervisor: '', supervisorContact: '',
  skills: [] as string[], otherSkills: '', certification1: '', certification2: '', certification3: '',
  referenceName: '', referencePosition: '', referenceCompany: '', referenceContact: '',
  submittedDocuments: [] as string[], otherDocument: '', applicantSignature: '', declarationDate: '',
  birthplace: '', height: '', weight: '', address: '', experience: '', tin: '', sss: '', philhealth: '', pagibig: '',
};

type FormState = typeof EMPTY;
type FormKey = keyof FormState;
type FieldErrors = Partial<Record<FormKey | 'resumeFiles', string>>;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function calculateAge(birthdate: string) {
  if (!birthdate) return '';
  const birth = new Date(birthdate);
  const today = new Date();
  if (Number.isNaN(birth.getTime()) || birth > today) return '';
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : '';
}

const fallbackBarangays = ['Poblacion', 'Barangay 1', 'Barangay 2', 'Barangay 3', 'Other / Not listed'];

export default function ApplyForJobPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [successDialog, setSuccessDialog] = useState(false);
  const [applicantId, setApplicantId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [characterReferences, setCharacterReferences] = useState<CharacterReference[]>([{ name: '', position: '', company: '', contact: '' }]);

  const textFieldSx = {
    '& .MuiInputLabel-root': { color: '#7b7b7b', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2f9e5b' },
    '& .MuiOutlinedInput-root': {
      borderRadius: '18px', backgroundColor: '#f9fcf9', transition: 'all 0.25s ease',
      '& input': { padding: '16px 14px', fontSize: '0.95rem', fontWeight: 500 },
      '& textarea': { padding: '16px 14px', fontSize: '0.95rem', fontWeight: 500 },
      '& fieldset': { borderColor: '#cfe5d5', borderWidth: '1.5px' },
      '&:hover fieldset': { borderColor: '#8dd5a2' },
      '&.Mui-focused fieldset': { borderColor: '#35a164', borderWidth: '2px', boxShadow: '0 0 0 5px rgba(53,161,100,0.10)' },
    },
  };

  const softButtonSx = {
    borderRadius: '18px', textTransform: 'none', fontWeight: 800, minHeight: 52, px: 4,
    transition: 'all 0.25s ease', boxShadow: '0 8px 20px rgba(31,122,71,0.14)',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 26px rgba(31,122,71,0.20)' },
  };

  const stepPaperSx = { p: { xs: 3, md: 4 }, mb: 3, borderRadius: 5, border: '1px solid rgba(22,101,52,0.08)', background: '#ffffff', minHeight: { xs: 'auto', md: 520 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' };
  const fieldGrid = { xs: 12, md: 4 };

  const clearFieldError = (key: FormKey | 'resumeFiles') => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const set = (key: FormKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    clearFieldError(key);
  };

  const setUpperText = (key: FormKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/[^a-zA-ZÀ-žñÑ .'-]/g, '');
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  const setNumeric = (key: FormKey, maxLength: number) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  const setEmail = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value.trim().toLowerCase() }));
    clearFieldError('email');
  };

  const setBirthdate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, birthdate: value, age: calculateAge(value) }));
    clearFieldError('birthdate');
    clearFieldError('age');
  };

  const setPhone = (key: 'contactNumber' | 'emergencyContactPhone') => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  };

  const buildAddress = (country: string, region: string, province: string, city: string, barangay: string, street: string, zipCode: string) =>
    [street, barangay, city, province, region, country, zipCode].map((part) => part.trim()).filter(Boolean).join(', ');

  const getProvinceOptions = (country: string, region: string) => country === 'Philippines' && region ? PH_PROVINCES_BY_REGION[region] ?? [] : [];
  const getCityOptions = (province: string) => CITIES_BY_PROVINCE[province] ?? [];
  const getBarangayOptions = (city: string) => BARANGAYS_BY_CITY[city] ?? fallbackBarangays;

  const handleAddressCountryChange = (prefix: 'current' | 'permanent', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${prefix}Country`]: value,
      [`${prefix}Region`]: '',
      [`${prefix}Province`]: '',
      [`${prefix}City`]: '',
      [`${prefix}Barangay`]: '',
      [`${prefix}ZipCode`]: '',
    } as FormState));
  };

  const handleAddressRegionChange = (prefix: 'current' | 'permanent', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${prefix}Region`]: value,
      [`${prefix}Province`]: '',
      [`${prefix}City`]: '',
      [`${prefix}Barangay`]: '',
      [`${prefix}ZipCode`]: '',
    } as FormState));
    clearFieldError(`${prefix}Region` as FormKey);
  };

  const handleAddressProvinceChange = (prefix: 'current' | 'permanent', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${prefix}Province`]: value,
      [`${prefix}City`]: '',
      [`${prefix}Barangay`]: '',
      [`${prefix}ZipCode`]: '',
    } as FormState));
    clearFieldError(`${prefix}Province` as FormKey);
  };

  const handleAddressCityChange = (prefix: 'current' | 'permanent', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${prefix}City`]: value,
      [`${prefix}Barangay`]: '',
      [`${prefix}ZipCode`]: ZIP_BY_CITY[value] ?? '',
    } as FormState));
    clearFieldError(`${prefix}City` as FormKey);
  };

  const handleAddressBarangayChange = (prefix: 'current' | 'permanent', value: string) => {
    setFormData((prev) => ({ ...prev, [`${prefix}Barangay`]: value } as FormState));
    clearFieldError(`${prefix}Barangay` as FormKey);
  };

  const copyCurrentToPermanent = () => {
    setFormData((prev) => ({
      ...prev,
      permanentCountry: prev.currentCountry,
      permanentRegion: prev.currentRegion,
      permanentProvince: prev.currentProvince,
      permanentCity: prev.currentCity,
      permanentBarangay: prev.currentBarangay,
      permanentStreet: prev.currentStreet,
      permanentZipCode: prev.currentZipCode,
      permanentAddress: buildAddress(prev.currentCountry, prev.currentRegion, prev.currentProvince, prev.currentCity, prev.currentBarangay, prev.currentStreet, prev.currentZipCode),
    }));
  };

  const toggleListItem = (key: 'skills' | 'submittedDocuments', value: string) => {
    setFormData((prev) => {
      const current = prev[key] as string[];
      return { ...prev, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
    });
    clearFieldError(key);
  };

  const updateCharacterReference = (index: number, key: keyof CharacterReference, value: string) => {
    setCharacterReferences((prev) => prev.map((reference, currentIndex) => currentIndex === index ? { ...reference, [key]: value } : reference));
  };
  const updateCharacterReferenceName = (index: number, value: string) => updateCharacterReference(index, 'name', value.replace(/[^a-zA-ZÀ-žñÑ .'-]/g, ''));
  const updateCharacterReferenceContact = (index: number, value: string) => updateCharacterReference(index, 'contact', value.replace(/\D/g, '').slice(0, 11));
  const addCharacterReference = () => setCharacterReferences((prev) => [...prev, { name: '', position: '', company: '', contact: '' }]);
  const removeCharacterReference = (index: number) => setCharacterReferences((prev) => prev.length === 1 ? prev : prev.filter((_, currentIndex) => currentIndex !== index));
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateStep = (stepIndex: number) => {
    const errors: FieldErrors = {};
    if (stepIndex === 0) {
      if (!formData.position) errors.position = 'Position title is required.';
      if (!formData.hearAbout) errors.hearAbout = 'Please select where you heard about the opening.';
      if (formData.hearAbout === 'Other' && !formData.hearAboutOther.trim()) errors.hearAboutOther = 'Please specify where you heard about the opening.';
    }
    if (stepIndex === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
      if (!formData.birthdate) errors.birthdate = 'Date of birth is required.';
      if (formData.birthdate && new Date(formData.birthdate) > new Date()) errors.birthdate = 'Date of birth cannot be in the future.';
      if (!formData.age) errors.age = 'Age is required.';
      if (!formData.gender) errors.gender = 'Gender is required.';
      if (!formData.civilStatus) errors.civilStatus = 'Civil status is required.';
      if (!formData.nationality) errors.nationality = 'Nationality is required.';
      if (!formData.contactNumber) errors.contactNumber = 'Contact number is required.';
      if (formData.contactNumber && formData.contactNumber.length !== 11) errors.contactNumber = 'Contact number must be exactly 11 digits.';
      if (!formData.email.trim()) errors.email = 'Email address is required.';
      if (formData.email && !validateEmail(formData.email)) errors.email = 'Please enter a valid email address.';
      if (!formData.currentCountry) errors.currentCountry = 'Current country is required.';
      if (formData.currentCountry === 'Philippines') {
        if (!formData.currentRegion) errors.currentRegion = 'Current region is required.';
        if (!formData.currentProvince) errors.currentProvince = 'Current province is required.';
        if (!formData.currentCity) errors.currentCity = 'Current city/municipality is required.';
        if (!formData.currentBarangay) errors.currentBarangay = 'Current barangay is required.';
      }
      if (!formData.currentStreet.trim()) errors.currentStreet = 'Current street/address line is required.';
    }
    if (stepIndex === 2) {
      if (!formData.education) errors.education = 'Educational level is required.';
      if (!formData.schoolName.trim()) errors.schoolName = 'School name is required.';
      if (formData.yearGraduated && formData.yearGraduated.length !== 4) errors.yearGraduated = 'Year graduated must be 4 digits.';
      if (formData.employmentStartDate && formData.employmentEndDate && formData.employmentEndDate < formData.employmentStartDate) errors.employmentEndDate = 'End date cannot be earlier than start date.';
      if (formData.totalYearsExperience && Number(formData.totalYearsExperience) > 80) errors.totalYearsExperience = 'Please enter a valid total years of experience.';
    }
    if (stepIndex === 3 && formData.skills.length === 0 && !formData.otherSkills.trim()) errors.skills = 'Please select at least one skill or enter other skills.';
    if (stepIndex === 4) {
      characterReferences.forEach((reference, index) => {
        const hasAnyValue = reference.name.trim() || reference.position.trim() || reference.company.trim() || reference.contact.trim();
        if (index === 0 || hasAnyValue) {
          if (!reference.name.trim()) errors.referenceName = `Reference ${index + 1}: name is required.`;
          if (!reference.position.trim()) errors.referencePosition = `Reference ${index + 1}: position/relationship is required.`;
          if (!reference.contact.trim()) errors.referenceContact = `Reference ${index + 1}: contact number is required.`;
          if (reference.contact && reference.contact.length !== 11) errors.referenceContact = `Reference ${index + 1}: contact number must be exactly 11 digits.`;
        }
      });
      if (!formData.emergencyContactName.trim()) errors.emergencyContactName = 'Emergency contact person is required.';
      if (!formData.emergencyContactRelation.trim()) errors.emergencyContactRelation = 'Relationship is required.';
      if (formData.emergencyContactRelation === 'Other' && !formData.emergencyContactRelationOther.trim()) errors.emergencyContactRelationOther = 'Please specify the relationship.';
      if (!formData.emergencyContactPhone) errors.emergencyContactPhone = 'Emergency contact number is required.';
      if (formData.emergencyContactPhone && formData.emergencyContactPhone.length !== 11) errors.emergencyContactPhone = 'Emergency contact number must be exactly 11 digits.';
    }
    if (stepIndex === 5) {
      if (resumeFiles.length === 0) errors.resumeFiles = 'Resume/Biodata file is required.';
      if (!formData.applicantSignature.trim()) errors.applicantSignature = 'Applicant signature/full name is required.';
      if (!formData.declarationDate) errors.declarationDate = 'Declaration date is required.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) { setError('Please complete the required fields before continuing.'); return false; }
    setError(''); return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= activeStep) { setActiveStep(targetStep); setError(''); return; }
    for (let i = activeStep; i < targetStep; i++) if (!validateStep(i)) return;
    setActiveStep(targetStep);
  };
  const handleNext = () => { if (validateStep(activeStep) && activeStep < steps.length - 1) setActiveStep((prev) => prev + 1); };
  const handleBack = () => { if (activeStep > 0) { setActiveStep((prev) => prev - 1); setError(''); } };
  const validateAllSteps = () => { for (let i = 0; i < steps.length; i++) if (!validateStep(i)) { setActiveStep(i); return false; } return true; };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAllSteps()) return;
    setSubmitting(true); setError('');
    try {
      const { count, error: countError } = await supabase.from('applicants').select('*', { count: 'exact', head: true });
      if (countError) throw countError;
      const nextNumber = ((count ?? 0) + 1).toString().padStart(4, '0');
      const applicantIdGenerated = `APP-2026-${nextNumber}`;
      const resumeFileData = resumeFiles[0] ? await fileToBase64(resumeFiles[0]) : null;
      const supportingDocumentFiles = await Promise.all(supportingFiles.map(async (file) => ({ name: file.name, type: file.type, data: await fileToBase64(file) })));
      const currentAddress = buildAddress(formData.currentCountry, formData.currentRegion, formData.currentProvince, formData.currentCity, formData.currentBarangay, formData.currentStreet, formData.currentZipCode);
      const permanentAddress = buildAddress(formData.permanentCountry, formData.permanentRegion, formData.permanentProvince, formData.permanentCity, formData.permanentBarangay, formData.permanentStreet, formData.permanentZipCode);
      const employmentPeriod = [formData.employmentStartDate, formData.employmentEndDate].filter(Boolean).join(' to ');
      const coverLetterData = {
        hearAbout: formData.hearAbout, hearAboutOther: formData.hearAboutOther, age: formData.age, nationality: formData.nationality, currentAddress, permanentAddress,
        currentAddressParts: { country: formData.currentCountry, region: formData.currentRegion, province: formData.currentProvince, city: formData.currentCity, barangay: formData.currentBarangay, street: formData.currentStreet, zipCode: formData.currentZipCode },
        permanentAddressParts: { country: formData.permanentCountry, region: formData.permanentRegion, province: formData.permanentProvince, city: formData.permanentCity, barangay: formData.permanentBarangay, street: formData.permanentStreet, zipCode: formData.permanentZipCode },
        educationBackground: { level: formData.education, schoolName: formData.schoolName, courseProgram: formData.courseProgram, yearGraduated: formData.yearGraduated, honorsAwards: formData.honorsAwards },
        workExperience: { companyOrganization: formData.companyOrganization, positionHeld: formData.positionHeld, employmentPeriod, employmentStartDate: formData.employmentStartDate, employmentEndDate: formData.employmentEndDate, dutiesResponsibilities: formData.dutiesResponsibilities, reasonForLeaving: formData.reasonForLeaving, totalYearsExperience: formData.totalYearsExperience, previousSupervisor: formData.previousSupervisor, supervisorContact: formData.supervisorContact },
        skills: formData.skills, otherSkills: formData.otherSkills, certifications: [formData.certification1, formData.certification2, formData.certification3].filter(Boolean),
        characterReferences: characterReferences.filter((reference) => reference.name.trim() || reference.position.trim() || reference.company.trim() || reference.contact.trim()),
        emergencyContact: { name: formData.emergencyContactName, relation: formData.emergencyContactRelation === 'Other' ? formData.emergencyContactRelationOther : formData.emergencyContactRelation, phone: formData.emergencyContactPhone, address: formData.emergencyContactAddress },
        submittedDocuments: formData.submittedDocuments, otherDocument: formData.otherDocument, applicantSignature: formData.applicantSignature, declarationDate: formData.declarationDate,
      };
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.suffix}`.replace(/\s+/g, ' ').trim();
      const { error: insertError } = await supabase.from('applicants').insert({
        applicant_id: applicantIdGenerated, name: fullName, first_name: formData.firstName.trim(), middle_name: formData.middleName.trim(), last_name: formData.lastName.trim(), suffix: formData.suffix,
        gender: formData.gender, civil_status: formData.civilStatus, birthdate: formData.birthdate || null, birthplace: formData.birthplace, height: formData.height, weight: formData.weight,
        email: formData.email.trim().toLowerCase(), phone_number: formData.contactNumber, address: currentAddress, position_applied: formData.position, education: formData.education, experience: formData.totalYearsExperience, cover_letter: JSON.stringify(coverLetterData),
        tin: formData.tin, sss: formData.sss, philhealth: formData.philhealth, pagibig: formData.pagibig,
        emergency_contact: `${formData.emergencyContactName} - ${formData.emergencyContactRelation === 'Other' ? formData.emergencyContactRelationOther : formData.emergencyContactRelation} - ${formData.emergencyContactPhone}`,
        resume_file_name: resumeFiles[0]?.name ?? null, resume_file_data: resumeFileData, supporting_documents: supportingFiles.map((file) => file.name), supporting_document_files: supportingDocumentFiles, status: 'Submitted',
      });
      if (insertError) throw insertError;
      saveApplicationFiles(applicantIdGenerated, { resumeFileName: resumeFiles[0]?.name ?? null, resumeFileData, supportingDocuments: supportingFiles.map((file) => file.name), supportingDocumentFiles });
      const { error: notificationError } = await supabase.from('notifications').insert([
        { recipient_role: 'hr', title: 'New Application Submitted', message: `${formData.firstName} ${formData.lastName} submitted a new application for ${formData.position}.`, type: 'application' },
        { recipient_role: 'gm', title: 'New Application Submitted', message: `${formData.firstName} ${formData.lastName} submitted a new application for ${formData.position}.`, type: 'application' },
      ]);
      if (notificationError) console.warn('Notification insert failed:', notificationError.message);
      setApplicantId(applicantIdGenerated); setSuccessDialog(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while submitting the application.');
    } finally { setSubmitting(false); }
  };

  const handleCopyId = async () => { setCopyFailed(false); const ok = await copyToClipboard(applicantId); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); } else setCopyFailed(true); };
  const handleCloseDialog = () => { setSuccessDialog(false); setFormData(EMPTY); setFieldErrors({}); setResumeFiles([]); setSupportingFiles([]); setCharacterReferences([{ name: '', position: '', company: '', contact: '' }]); setActiveStep(0); setError(''); };

  const renderCountrySelect = (prefix: 'current' | 'permanent', label = 'Country') => {
    const value = formData[`${prefix}Country` as FormKey] as string;
    return (
      <TextField fullWidth required={prefix === 'current'} select label={label} value={value} onChange={(e) => handleAddressCountryChange(prefix, e.target.value)} sx={textFieldSx} InputLabelProps={{ shrink: true }}>
        {COUNTRIES.map((country) => <MenuItem key={country} value={country}>{country}</MenuItem>)}
      </TextField>
    );
  };

  const renderPhilippineAddressFields = (prefix: 'current' | 'permanent') => {
    const isCurrent = prefix === 'current';
    const country = formData[`${prefix}Country` as FormKey] as string;
    const region = formData[`${prefix}Region` as FormKey] as string;
    const province = formData[`${prefix}Province` as FormKey] as string;
    const city = formData[`${prefix}City` as FormKey] as string;
    const provinceOptions = getProvinceOptions(country, region);
    const cityOptions = getCityOptions(province);
    const barangayOptions = getBarangayOptions(city);

    return (
      <>
        <Grid size={{ xs: 12, md: 3 }}>{renderCountrySelect(prefix)}</Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth required={isCurrent} select label="Region" value={region} onChange={(e) => handleAddressRegionChange(prefix, e.target.value)} error={isCurrent && !!fieldErrors.currentRegion} helperText={isCurrent ? fieldErrors.currentRegion : ''} sx={textFieldSx} InputLabelProps={{ shrink: true }} disabled={country !== 'Philippines'}>
            {Object.keys(PH_PROVINCES_BY_REGION).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth required={isCurrent} select label="Province" value={province} onChange={(e) => handleAddressProvinceChange(prefix, e.target.value)} error={isCurrent && !!fieldErrors.currentProvince} helperText={isCurrent ? fieldErrors.currentProvince : ''} sx={textFieldSx} InputLabelProps={{ shrink: true }} disabled={country !== 'Philippines' || !region}>
            {provinceOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth required={isCurrent} select label="City / Municipality" value={city} onChange={(e) => handleAddressCityChange(prefix, e.target.value)} error={isCurrent && !!fieldErrors.currentCity} helperText={isCurrent ? fieldErrors.currentCity : ''} sx={textFieldSx} InputLabelProps={{ shrink: true }} disabled={country !== 'Philippines' || !province}>
            {cityOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth required={isCurrent} select label="Barangay" value={formData[`${prefix}Barangay` as FormKey] as string} onChange={(e) => handleAddressBarangayChange(prefix, e.target.value)} error={isCurrent && !!fieldErrors.currentBarangay} helperText={isCurrent ? fieldErrors.currentBarangay : ''} sx={textFieldSx} InputLabelProps={{ shrink: true }} disabled={country !== 'Philippines' || !city}>
            {barangayOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth required={isCurrent} label="Street / House No. / Purok" value={formData[`${prefix}Street` as FormKey] as string} onChange={set(`${prefix}Street` as FormKey)} error={isCurrent && !!fieldErrors.currentStreet} helperText={isCurrent ? fieldErrors.currentStreet : ''} inputProps={{ maxLength: 120 }} sx={textFieldSx} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth label="ZIP Code" value={formData[`${prefix}ZipCode` as FormKey] as string} InputProps={{ readOnly: true }} helperText={city ? 'Auto-generated from selected city.' : 'Select city to auto-fill.'} sx={textFieldSx} />
        </Grid>
      </>
    );
  };

  return (
    <AuthBackground>
      <Box sx={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 4, py: { xs: 2, md: 5 }, px: { xs: 1.5, md: 3 } }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
            <Box><Typography variant="h3" fontWeight={900} sx={{ color: '#14532d', lineHeight: 1 }}>Buenaventura Estate</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Human Resource Information System — Applicant Portal</Typography></Box>
            <Button variant="contained" onClick={() => navigate('/')} sx={{ ...softButtonSx, px: 4, py: 1.2, background: '#166534', '&:hover': { background: '#14532d' } }}>Back to Careers</Button>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', background: '#ffffff', boxShadow: '0 25px 70px rgba(0,0,0,0.14)' }}>
            <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderBottom: '1px solid rgba(22,101,52,0.08)' }}>
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }}>
                <Box><Typography variant="h4" fontWeight={900} sx={{ color: '#14532d', mb: 1 }}>Job Application Form</Typography><Typography color="text.secondary">Complete your application details and upload your requirements.</Typography></Box>
                <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing={{ xs: 1.5, md: 2 }} sx={{ width: { xs: '100%', lg: 'auto' }, flexWrap: 'wrap' }}>
                  {steps.map((step, index) => <Stack key={step} alignItems="center" spacing={1} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer', width: 86, flexShrink: 0 }}><Box sx={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', bgcolor: activeStep === index ? '#16a34a' : '#f0fdf4', color: activeStep === index ? '#fff' : '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', border: '1px solid #bbf7d0' }}>{index + 1}</Box><Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textAlign: 'center', lineHeight: 1.2 }}>{step}</Typography></Stack>)}
                </Stack>
              </Stack>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2.5, md: 4.5 } }}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              {activeStep === 0 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#14532d' }}>I. Position Applied For</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Select the position you are applying for and how you found this job opening.</Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required select label="Position Title" value={formData.position} onChange={set('position')} error={!!fieldErrors.position} helperText={fieldErrors.position} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{POSITIONS.map((position) => <MenuItem key={position} value={position}>{position}</MenuItem>)}</TextField></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required select label="How did you hear about this job opening?" value={formData.hearAbout} onChange={set('hearAbout')} error={!!fieldErrors.hearAbout} helperText={fieldErrors.hearAbout} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{HEAR_ABOUT_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField></Grid>
                    {formData.hearAbout === 'Other' && <Grid size={{ xs: 12 }}><TextField fullWidth required label="Please specify" value={formData.hearAboutOther} onChange={set('hearAboutOther')} error={!!fieldErrors.hearAboutOther} helperText={fieldErrors.hearAboutOther} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>}
                  </Grid>
                </Paper>
              )}

              {activeStep === 1 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#14532d' }}>II. Personal Details</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Enter your personal details and complete address information accurately.</Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth required label="First Name" value={formData.firstName} onChange={setUpperText('firstName')} error={!!fieldErrors.firstName} helperText={fieldErrors.firstName} inputProps={{ maxLength: 50 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="Middle Name" value={formData.middleName} onChange={setUpperText('middleName')} inputProps={{ maxLength: 50 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth required label="Last Name" value={formData.lastName} onChange={setUpperText('lastName')} error={!!fieldErrors.lastName} helperText={fieldErrors.lastName} inputProps={{ maxLength: 50 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth select label="Suffix" value={formData.suffix} onChange={set('suffix')} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{SUFFIXES.map((suffix) => <MenuItem key={suffix || 'none'} value={suffix}>{suffix || 'None'}</MenuItem>)}</TextField></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required type="date" label="Date of Birth" value={formData.birthdate} onChange={setBirthdate} error={!!fieldErrors.birthdate} helperText={fieldErrors.birthdate} InputLabelProps={{ shrink: true }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required label="Age" value={formData.age} onChange={setNumeric('age', 3)} error={!!fieldErrors.age} helperText={fieldErrors.age || 'Auto-computed from birthdate but editable.'} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required select label="Gender" value={formData.gender} onChange={set('gender')} error={!!fieldErrors.gender} helperText={fieldErrors.gender} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{GENDER.map((gender) => <MenuItem key={gender} value={gender}>{gender}</MenuItem>)}</TextField></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required select label="Civil Status" value={formData.civilStatus} onChange={set('civilStatus')} error={!!fieldErrors.civilStatus} helperText={fieldErrors.civilStatus} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{CIVIL_STATUS.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required select label="Nationality" value={formData.nationality} onChange={set('nationality')} error={!!fieldErrors.nationality} helperText={fieldErrors.nationality} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{NATIONALITIES.map((nationality) => <MenuItem key={nationality} value={nationality}>{nationality}</MenuItem>)}</TextField></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required label="Contact Number" value={formData.contactNumber} onChange={setPhone('contactNumber')} error={!!fieldErrors.contactNumber} helperText={fieldErrors.contactNumber || '11-digit mobile number only.'} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 11 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required type="email" label="Email Address" value={formData.email} onChange={setEmail} error={!!fieldErrors.email} helperText={fieldErrors.email} inputProps={{ maxLength: 80 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12 }}><Typography fontWeight={900} sx={{ mt: 1, mb: 1, color: '#14532d' }}>Current Address</Typography></Grid>
                    {renderPhilippineAddressFields('current')}
                    <Grid size={{ xs: 12 }}><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mt: 2, mb: 1 }}><Typography fontWeight={900} sx={{ color: '#14532d' }}>Permanent Address</Typography><Button type="button" variant="outlined" onClick={copyCurrentToPermanent} sx={{ ...softButtonSx, borderColor: '#166534', color: '#166534', background: '#ffffff', minHeight: 44 }}>Same as Current Address</Button></Stack></Grid>
                    {renderPhilippineAddressFields('permanent')}
                  </Grid>
                </Paper>
              )}

              {activeStep === 2 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#14532d' }}>III. Educational Background and IV. Work Experience</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Provide your educational background and previous work experience, if applicable.</Typography>
                  <Stack spacing={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(22,101,52,0.10)', background: '#fbfefb' }}>
                      <Typography fontWeight={900} sx={{ color: '#14532d', mb: 2 }}>Educational Background</Typography>
                      <Grid container spacing={2.5}>
                        <Grid size={fieldGrid}><TextField fullWidth required select label="Educational Level" value={formData.education} onChange={set('education')} error={!!fieldErrors.education} helperText={fieldErrors.education} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{EDUCATIONAL_ATTAINMENT.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}</TextField></Grid>
                        <Grid size={fieldGrid}><TextField fullWidth required label="Name of School" value={formData.schoolName} onChange={set('schoolName')} error={!!fieldErrors.schoolName} helperText={fieldErrors.schoolName} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                        <Grid size={fieldGrid}><TextField fullWidth label="Course / Program" value={formData.courseProgram} onChange={set('courseProgram')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                        <Grid size={fieldGrid}><TextField fullWidth label="Year Graduated" value={formData.yearGraduated} onChange={setNumeric('yearGraduated', 4)} error={!!fieldErrors.yearGraduated} helperText={fieldErrors.yearGraduated} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 8 }}><TextField fullWidth label="Honors / Awards" value={formData.honorsAwards} onChange={set('honorsAwards')} inputProps={{ maxLength: 160 }} sx={textFieldSx} /></Grid>
                      </Grid>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(22,101,52,0.10)', background: '#fbfefb' }}>
                      <Typography fontWeight={900} sx={{ color: '#14532d', mb: 2 }}>Work Experience</Typography>
                      <Grid container spacing={2.5}>
                        <Grid size={fieldGrid}><TextField fullWidth label="Company / Organization" value={formData.companyOrganization} onChange={set('companyOrganization')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                        <Grid size={fieldGrid}><TextField fullWidth label="Position Held" value={formData.positionHeld} onChange={set('positionHeld')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                        <Grid size={fieldGrid}><TextField fullWidth label="Total Years of Work Experience" value={formData.totalYearsExperience} onChange={setNumeric('totalYearsExperience', 2)} error={!!fieldErrors.totalYearsExperience} helperText={fieldErrors.totalYearsExperience} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2 }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Employment Start Date" value={formData.employmentStartDate} onChange={set('employmentStartDate')} InputLabelProps={{ shrink: true }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Employment End Date" value={formData.employmentEndDate} onChange={set('employmentEndDate')} error={!!fieldErrors.employmentEndDate} helperText={fieldErrors.employmentEndDate} InputLabelProps={{ shrink: true }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth multiline minRows={3} label="Duties / Responsibilities" value={formData.dutiesResponsibilities} onChange={set('dutiesResponsibilities')} inputProps={{ maxLength: 500 }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth multiline minRows={3} label="Reason for Leaving" value={formData.reasonForLeaving} onChange={set('reasonForLeaving')} inputProps={{ maxLength: 500 }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Previous Supervisor / Manager" value={formData.previousSupervisor} onChange={setUpperText('previousSupervisor')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Supervisor Contact Number / Email" value={formData.supervisorContact} onChange={set('supervisorContact')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                </Paper>
              )}

              {activeStep === 3 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#14532d' }}>V. Skills and Qualifications</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Select the skills that apply to you. You may also add other skills and trainings.</Typography>
                  {fieldErrors.skills && <Alert severity="warning" sx={{ mb: 2 }}>{fieldErrors.skills}</Alert>}
                  <FormGroup row>{SKILLS.map((skill) => <FormControlLabel key={skill} control={<Checkbox checked={formData.skills.includes(skill)} onChange={() => toggleListItem('skills', skill)} />} label={skill} sx={{ width: { xs: '100%', md: '32%' }, mr: 0 }} />)}</FormGroup>
                  <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}><TextField fullWidth label="Other Skills" value={formData.otherSkills} onChange={set('otherSkills')} inputProps={{ maxLength: 200 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth label="Certification / Training 1" value={formData.certification1} onChange={set('certification1')} inputProps={{ maxLength: 160 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth label="Certification / Training 2" value={formData.certification2} onChange={set('certification2')} inputProps={{ maxLength: 160 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth label="Certification / Training 3" value={formData.certification3} onChange={set('certification3')} inputProps={{ maxLength: 160 }} sx={textFieldSx} /></Grid>
                  </Grid>
                </Paper>
              )}

              {activeStep === 4 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 1 }}>
                    <Box><Typography variant="h6" fontWeight={900} sx={{ color: '#14532d' }}>VI. Character References and Emergency Contact</Typography><Typography color="text.secondary">Add character references and emergency contact information.</Typography></Box>
                    <Button type="button" variant="outlined" startIcon={<Add />} onClick={addCharacterReference} sx={{ ...softButtonSx, borderColor: '#166534', color: '#166534', background: '#ffffff', minHeight: 44 }}>Add Character Reference</Button>
                  </Stack>
                  {fieldErrors.referenceName && <Alert severity="warning" sx={{ mb: 2 }}>{fieldErrors.referenceName}</Alert>}
                  {fieldErrors.referencePosition && <Alert severity="warning" sx={{ mb: 2 }}>{fieldErrors.referencePosition}</Alert>}
                  {fieldErrors.referenceContact && <Alert severity="warning" sx={{ mb: 2 }}>{fieldErrors.referenceContact}</Alert>}
                  <Stack spacing={2.5}>{characterReferences.map((reference, index) => <Paper key={`reference-${index}`} elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid rgba(22,101,52,0.10)', background: '#fbfefb' }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}><Typography fontWeight={900} sx={{ color: '#14532d' }}>Character Reference {index + 1}</Typography>{characterReferences.length > 1 && <Button type="button" color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeCharacterReference(index)} sx={{ ...softButtonSx, minHeight: 40 }}>Remove</Button>}</Stack><Grid container spacing={2.5}><Grid size={fieldGrid}><TextField fullWidth label="Reference Name" value={reference.name} onChange={(e) => updateCharacterReferenceName(index, e.target.value)} inputProps={{ maxLength: 80 }} sx={textFieldSx} /></Grid><Grid size={fieldGrid}><TextField fullWidth label="Position / Relationship" value={reference.position} onChange={(e) => updateCharacterReference(index, 'position', e.target.value)} inputProps={{ maxLength: 80 }} sx={textFieldSx} /></Grid><Grid size={fieldGrid}><TextField fullWidth label="Company / Organization" value={reference.company} onChange={(e) => updateCharacterReference(index, 'company', e.target.value)} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid><Grid size={fieldGrid}><TextField fullWidth label="Reference Contact Number" value={reference.contact} onChange={(e) => updateCharacterReferenceContact(index, e.target.value)} helperText="11-digit contact number only." inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 11 }} sx={textFieldSx} /></Grid></Grid></Paper>)}</Stack>
                  <Typography variant="h6" fontWeight={900} sx={{ mt: 4, mb: 2, color: '#14532d' }}>Emergency Contact</Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={fieldGrid}><TextField fullWidth required label="Emergency Contact Person" value={formData.emergencyContactName} onChange={setUpperText('emergencyContactName')} error={!!fieldErrors.emergencyContactName} helperText={fieldErrors.emergencyContactName} inputProps={{ maxLength: 80 }} sx={textFieldSx} /></Grid>
                    <Grid size={fieldGrid}><TextField fullWidth required select label="Relationship" value={formData.emergencyContactRelation} onChange={set('emergencyContactRelation')} error={!!fieldErrors.emergencyContactRelation} helperText={fieldErrors.emergencyContactRelation} InputLabelProps={{ shrink: true }} sx={textFieldSx}>{RELATIONSHIPS.map((relationship) => <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>)}</TextField></Grid>
                    {formData.emergencyContactRelation === 'Other' && <Grid size={fieldGrid}><TextField fullWidth required label="Please specify relationship" value={formData.emergencyContactRelationOther} onChange={setUpperText('emergencyContactRelationOther')} error={!!fieldErrors.emergencyContactRelationOther} helperText={fieldErrors.emergencyContactRelationOther} inputProps={{ maxLength: 80 }} sx={textFieldSx} /></Grid>}
                    <Grid size={fieldGrid}><TextField fullWidth required label="Emergency Contact Number" value={formData.emergencyContactPhone} onChange={setPhone('emergencyContactPhone')} error={!!fieldErrors.emergencyContactPhone} helperText={fieldErrors.emergencyContactPhone || '11-digit contact number only.'} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 11 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: formData.emergencyContactRelation === 'Other' ? 12 : 8 }}><TextField fullWidth label="Emergency Contact Address" value={formData.emergencyContactAddress} onChange={set('emergencyContactAddress')} inputProps={{ maxLength: 160 }} sx={textFieldSx} /></Grid>
                  </Grid>
                </Paper>
              )}

              {activeStep === 5 && (
                <Paper elevation={0} sx={stepPaperSx}>
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#14532d' }}>VII. Required Documents and VIII. Applicant Declaration</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Upload your resume and confirm the accuracy of your submitted information.</Typography>
                  <FormGroup row>{REQUIRED_DOCUMENTS.map((documentName) => <FormControlLabel key={documentName} control={<Checkbox checked={formData.submittedDocuments.includes(documentName)} onChange={() => toggleListItem('submittedDocuments', documentName)} />} label={documentName} sx={{ width: { xs: '100%', md: '32%' }, mr: 0 }} />)}</FormGroup>
                  <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}><TextField fullWidth label="Other Document" value={formData.otherDocument} onChange={set('otherDocument')} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ ...softButtonSx, borderColor: '#166534', color: '#166534', background: '#ffffff', minHeight: 90 }}><input hidden type="file" accept="*/*" onChange={(e) => { const files = Array.from(e.target.files ?? []); setResumeFiles(files.slice(0, 1)); clearFieldError('resumeFiles'); }} />{resumeFiles[0] ? `Resume: ${resumeFiles[0].name}` : 'Select Resume / Biodata'}</Button>{fieldErrors.resumeFiles && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{fieldErrors.resumeFiles}</Typography>}</Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ ...softButtonSx, borderColor: '#166534', color: '#166534', background: '#ffffff', minHeight: 90 }}><input hidden multiple type="file" accept="*/*" onChange={(e) => setSupportingFiles(Array.from(e.target.files ?? []))} />{supportingFiles.length > 0 ? `${supportingFiles.length} supporting file(s) selected` : 'Select Supporting Documents'}</Button></Grid>
                    <Grid size={{ xs: 12 }}>{supportingFiles.length > 0 && <Typography variant="body2" color="text.secondary">{supportingFiles.map((file) => file.name).join(', ')}</Typography>}</Grid>
                    <Grid size={{ xs: 12 }}><Alert severity="info">I hereby certify that all information provided in this application form is true, complete, and correct to the best of my knowledge. I understand that any false information or omission may result in the rejection of my application or termination of employment if hired.</Alert></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required label="Applicant's Signature / Full Name" value={formData.applicantSignature} onChange={setUpperText('applicantSignature')} error={!!fieldErrors.applicantSignature} helperText={fieldErrors.applicantSignature} inputProps={{ maxLength: 120 }} sx={textFieldSx} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required type="date" label="Date" value={formData.declarationDate} onChange={set('declarationDate')} error={!!fieldErrors.declarationDate} helperText={fieldErrors.declarationDate} InputLabelProps={{ shrink: true }} sx={textFieldSx} /></Grid>
                  </Grid>
                </Paper>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mt: 3, pt: 2 }}>
                <Button type="button" variant="outlined" onClick={activeStep === 0 ? () => navigate('/') : handleBack} sx={{ ...softButtonSx, px: 5, py: 1.5, borderColor: '#166534', color: '#166534', minWidth: 160, width: { xs: '100%', sm: 'auto' }, background: '#ffffff' }}>{activeStep === 0 ? 'Cancel' : 'Back'}</Button>
                {activeStep < steps.length - 1 ? <Button type="button" variant="contained" onClick={handleNext} sx={{ ...softButtonSx, px: 6, py: 1.5, minWidth: 180, width: { xs: '100%', sm: 'auto' }, background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)', boxShadow: '0 12px 25px rgba(22,101,52,0.25)' }}>Next Step</Button> : <Button type="submit" variant="contained" startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Send />} disabled={submitting} sx={{ ...softButtonSx, px: 6, py: 1.5, minWidth: 220, width: { xs: '100%', sm: 'auto' }, background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)', boxShadow: '0 12px 25px rgba(22,101,52,0.25)' }}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>}
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Dialog open={successDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}><TaskAlt color="success" sx={{ fontSize: 70, mb: 2 }} /><Typography variant="h5" fontWeight={900} gutterBottom>Application Submitted Successfully</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Please save your Applicant ID. You will use this to track your application status.</Typography><Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(31,122,71,0.08)', border: '1px solid rgba(31,122,71,0.18)', mb: 2 }}><Typography variant="h6" fontWeight={900} color="primary">{applicantId}</Typography></Paper>{copied && <Alert severity="success" sx={{ mb: 2 }}>Applicant ID copied!</Alert>}{copyFailed && <Alert severity="error" sx={{ mb: 2 }}>Unable to copy Applicant ID.</Alert>}</DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}><Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopyId} sx={{ ...softButtonSx, borderColor: '#166534', color: '#166534', background: '#ffffff' }}>Copy Applicant ID</Button><Button variant="contained" onClick={() => navigate('/track')} sx={{ ...softButtonSx, background: 'linear-gradient(135deg, #1F7A47 0%, #3FA46A 100%)' }}>Track Application</Button><Button onClick={handleCloseDialog} sx={softButtonSx}>Close</Button></DialogActions>
      </Dialog>
    </AuthBackground>
  );
}
