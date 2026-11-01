export const DICTIONARY = {
  en: {
    clinicName: 'Smile Dental Clinic',
    tagline: 'A healthier smile. A more confident you.',
    bookAppointment: 'Book Appointment',
    chatWhatsApp: 'Chat on WhatsApp',
    callNow: 'Call Clinic',
    startOver: 'Start Over',
    switchLanguage: 'Urdu mein baat karein',
    step1Title: 'Select Treatment',
    step2Title: 'Choose Date & Time',
    step3Title: 'Patient Information',
    fullNameLabel: 'Full Name',
    phoneLabel: 'Mobile Number',
    phonePlaceholder: '0300-1234567',
    reasonLabel: 'Reason for visit (Optional)',
    reasonPlaceholder: 'e.g. Toothache, routine scaling, whitening...',
    consentText: 'I agree to receive appointment updates via WhatsApp and SMS.',
    privacyLinkText: 'Privacy Policy',
    confirmBookingBtn: 'Confirm Appointment',
    backBtn: 'Back',
    nextBtn: 'Next',
    loadingSlots: 'Checking doctor availability...',
    noSlotsFound: 'No available slots on this day. Please select another date.',
    bookingSuccessTitle: 'Appointment Scheduled!',
    bookingSuccessDesc: 'Your appointment is confirmed with Dr. Zeeshan Ahmad. A confirmation message and calendar invite have been generated.',
    addToCalendar: 'Add to Calendar (.ics)',
    viewDetails: 'Manage Appointment',
    emergencyBanner: 'Dental Emergency? Severe pain, swelling, or trauma? Call us immediately.',
    emergencyCallBtn: 'Call Doctor Now',
    botWelcome: 'Hello! Welcome to Smile Dental Clinic. I can help you schedule an appointment, check treatment charges, or answer clinic questions. How may I help you today?',
    botIntentBooking: 'Book an Appointment',
    botIntentServices: 'Services & Prices',
    botIntentHours: 'Hours & Location',
    botIntentEmergency: 'Emergency Care',
    botIntentManage: 'Cancel or Reschedule',
    botAskService: 'Please select the dental treatment you need:',
    botAskDate: 'Which day would you like to visit? You can also type e.g. "Tomorrow" or "Next Monday".',
    botAskTime: 'Please select an available appointment time:',
    botAskName: 'Please provide the patient’s full name:',
    botAskPhone: 'Please enter your mobile phone number (e.g. 0300-1234567):',
    botConfirmPrompt: (details: { service: string; date: string; time: string; name: string }) =>
      `Please confirm your booking details:\n• Patient: ${details.name}\n• Service: ${details.service}\n• Time: ${details.date} at ${details.time}`,
    botYesConfirm: 'Yes, Confirm',
    botNoChange: 'No, Change Details',
    botBookingConfirmed: (timeStr: string, token: string) =>
      `🎉 Your appointment has been booked for ${timeStr}!\n\nYou can view, cancel, or reschedule your appointment at any time using this link:\n/appointment/${token}`,
    botCancelledSuccess: 'Your appointment has been cancelled. Would you like to book a new time?',
    botEmergencyResponse: '⚠️ If you are experiencing intense bleeding, acute trauma, or unbearable swelling, please call our clinic emergency line right away at +92 300 1234567. We also have emergency priority slots open.',
    errorInvalidPhone: 'Please enter a valid 11-digit Pakistani mobile number (e.g. 0300 1234567).',
    errorInvalidName: 'Please enter a valid full name.',
    errorSlotTaken: 'This time slot was just booked by another patient. Please choose another time.',
    errorSlotNotAvailable: 'Selected time is outside doctor clinic hours or falling during a prayer break.',
  },
  roman_ur: {
    clinicName: 'Smile Dental Clinic',
    tagline: 'Sehatmand muskurahat. Pur-aitimad aap.',
    bookAppointment: 'Appointment Book Karein',
    chatWhatsApp: 'WhatsApp Par Rabta Karein',
    callNow: 'Clinic Ko Call Karein',
    startOver: 'Dobara Shuru Karein',
    switchLanguage: 'Switch to English',
    step1Title: 'Ilaaj Ka Intikhab Karein',
    step2Title: 'Tareekh Aur Waqt Chunain',
    step3Title: 'Mareez Ki Maloomat',
    fullNameLabel: 'Mukammal Naam',
    phoneLabel: 'Mobile Number',
    phonePlaceholder: '0300-1234567',
    reasonLabel: 'Wajah (Ikhtiari)',
    reasonPlaceholder: 'Maslan: dant mein dard, safai, whitening...',
    consentText: 'Main WhatsApp aur SMS par appointment updates lene ki ijazat deta hoon.',
    privacyLinkText: 'Privacy Policy',
    confirmBookingBtn: 'Appointment Confirm Karein',
    backBtn: 'Wapis',
    nextBtn: 'Aagay',
    loadingSlots: 'Doctor ki dastiyabi check ho rahi hai...',
    noSlotsFound: 'Is din koi slot khali nahi hai. Barah-e-karam doosri tareekh chunain.',
    bookingSuccessTitle: 'Appointment Book Ho Gaya!',
    bookingSuccessDesc: 'Dr. Zeeshan Ahmad ke sath aap ka appointment confirm ho chuka hai. Tafseelat WhatsApp par bhi bhej di gayi hain.',
    addToCalendar: 'Calendar Mein Save Karein (.ics)',
    viewDetails: 'Appointment Dekhein ya Tabdeel Karein',
    emergencyBanner: 'Dant ka shadeed dard, soojan ya khoon? Foran call karein.',
    emergencyCallBtn: 'Doctor Ko Foran Call Karein',
    botWelcome: 'Assalam-o-Alaikum! Smile Dental Clinic mein khush-amdeed. Main appointment book karne, fees maloom karne ya clinic timings batane mein aap ki madad kar sakta hoon. Aaj main aap ki kya madad karoon?',
    botIntentBooking: 'Appointment Book Karna Hai',
    botIntentServices: 'Services Aur Fees',
    botIntentHours: 'Timings Aur Address',
    botIntentEmergency: 'Emergency / Shadeed Dard',
    botIntentManage: 'Cancel Ya Reschedule Karna',
    botAskService: 'Barah-e-karam batayein konsa ilaaj karwana chahte hain:',
    botAskDate: 'Aap kis din aana chahte hain? Aap likh bhi sakte hain maslan "Kal" ya "Agla Peer".',
    botAskTime: 'Barah-e-karam khali waqt mein se intikhab karein:',
    botAskName: 'Barah-e-karam mareez ka mukammal naam darj karein:',
    botAskPhone: 'Apna mobile number likhein (maslan 0300-1234567):',
    botConfirmPrompt: (details: { service: string; date: string; time: string; name: string }) =>
      `Barah-e-karam booking ki tasdeeq karein:\n• Mareez: ${details.name}\n• Ilaaj: ${details.service}\n• Waqt: ${details.date} ba-waqt ${details.time}`,
    botYesConfirm: 'Haan, Confirm Hai',
    botNoChange: 'Nahi, Tabdeel Karein',
    botBookingConfirmed: (timeStr: string, token: string) =>
      `🎉 Mubarak ho! Aap ka appointment ${timeStr} par book ho chuka hai.\n\nAap is link se apna appointment kisi bhi waqt dekh, cancel ya reschedule kar sakte hain:\n/appointment/${token}`,
    botCancelledSuccess: 'Aap ka appointment cancel kar diya gaya hai. Kya aap naya waqt book karna chahte hain?',
    botEmergencyResponse: '⚠️ Agar bohat shadeed dard, soojan ya khoon beh raha hai to barah-e-karam foran hamaray emergency number +92 300 1234567 par call karein. Hum ne emergency mareezon ke liye slots makhsoos kiye hue hain.',
    errorInvalidPhone: 'Barah-e-karam durust Pakistani mobile number likhein (maslan 0300 1234567).',
    errorInvalidName: 'Barah-e-karam mukammal naam darj karein.',
    errorSlotTaken: 'Yeh slot abhi kisi doosray mareez ne book kar liya hai. Barah-e-karam koi aur waqt chunain.',
    errorSlotNotAvailable: 'Muntakhab shuda waqt clinic ke auqaat se bahar hai ya Jumma namaz ke waqfay mein hai.',
  }
};

// Date formatter in Pakistan Time (12-hour format e.g. "Tuesday, 4 Nov, 5:30 PM")
export function formatPakistanDateTime(isoDateStr: string): string {
  try {
    const d = new Date(isoDateStr);
    return d.toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoDateStr;
  }
}

export function formatPakistanTime(isoDateStr: string): string {
  try {
    const d = new Date(isoDateStr);
    return d.toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoDateStr;
  }
}
