import { de as deLocale, enUS as enLocale } from 'date-fns/locale';

export type Language = 'de' | 'en';

export const translations = {
  en: {
    // Header
    appName: 'B-Mobil',
    appSubtitle: '',
    switchUser: 'Switch User',
    admin: 'Admin',

    // Tabs
    tabSchedule: 'Schedule',
    tabAlerts: 'Alerts',
    tabFamily: 'Family',

    // Calendar
    today: 'Today',
    prevDays: 'Previous 7 days',
    nextDays: 'Next 7 days',
    bookCar: 'Book Car',
    reserveDay: 'Reserve This Day',
    carFreeAllDay: 'Car Free All Day',
    carFreeDescription: 'No reservations scheduled for this day yet. Need the car? Reserve it in a few taps.',
    confirmedReservations: (count: number) => `${count} confirmed reservation${count > 1 ? 's' : ''}`,
    carAvailableAllDay: 'Car is available all day',
    timelineTitle: '24h Availability Timeline',
    freeAllDay: 'Free all day',
    reservedBlocks: (count: number) => `${count} reserved block${count > 1 ? 's' : ''}`,
    tapToBookFullDay: 'Tap to book full day',
    quickReserve: 'One-tap quick reserve:',
    you: 'You',
    cancelReservation: 'Cancel reservation',
    cancelConfirm: (name: string) => `Cancel reservation for ${name}?`,
    waitingListTitle: 'Waiting List on this Date',
    readyToClaim: 'Car freed up! Ready to claim.',
    claimSlot: 'Claim Slot',
    waitingAlert: (name: string, count: number) =>
      count === 1 ? `${name} is waiting for this slot` : `${count} family members waiting`,
    waitingAlertOwner: 'If your plans change, cancelling frees the car immediately for them!',
    waitingAlertOther: 'You will be notified immediately if this reservation gets cancelled.',

    // Slots
    slotFullDay: 'Full Day',
    slotFullDaySub: 'All Day',
    slotMorning: 'Morning',
    slotMorningSub: '08:00 – 13:00',
    slotAfternoon: 'Afternoon',
    slotAfternoonSub: '13:00 – 18:00',
    slotEvening: 'Evening',
    slotEveningSub: '18:00 – 23:00',
    slotCustom: 'Custom Hours',
    slotCustomBtn: 'Specify Custom Hours',

    // Booking Modal
    reserveCarModalTitle: 'Reserve Car',
    reservingAs: 'Reserving as',
    reservationDate: 'Reservation Date',
    timeBlock: 'Time Block',
    from: 'From',
    until: 'Until',
    tripReasonLabel: 'Trip Reason / Destination (Optional)',
    tripReasonPlaceholder: 'e.g. Grocery shopping, soccer practice, doctor appointment',
    conflictTitle: 'Car Already Reserved',
    conflictText: (name: string, date: string, slot: string) =>
      `${name} has booked this time on ${date} (${slot}).`,
    conflictHint: (name: string) =>
      `Join the waiting list below. ${name} will be notified immediately.`,
    joinWaitingList: 'Join Waiting List',
    confirmReservation: 'Confirm Reservation',
    confirmMultiReservation: (count: number) => `Confirm ${count} Days Reservation`,
    alreadyBookedByYou: 'You already have a reservation at this time.',
    alreadyBookedByYouSub: 'To change your reservation, please cancel it first or choose another time slot.',
    alreadyReservedBtn: 'Already Reserved by You',

    // Multi-day booking
    multiDayToggle: 'Book multiple days',
    multiDaySelected: (count: number) =>
      count === 1 ? '1 day selected for this trip' : `${count} days selected for this trip`,
    multiDayHint: 'Tap additional days below to reserve all with the same schedule & reason:',

    // Alerts
    activityAlerts: 'Activity & Alerts',
    totalUpdates: (count: number) => `${count} total update${count !== 1 ? 's' : ''}`,
    markAllRead: 'Mark all read',
    allCaughtUp: 'All Caught Up',
    allCaughtUpSub: 'You will receive instant alerts here when someone requests or frees a car slot.',
    claimCarSlot: 'Claim this Car Slot',
    activeFamilyWaitlist: 'Active Family Waitlist',
    waitingFor: (date: string, slot: string) => `waiting for ${date} (${slot})`,
    statusOffered: 'Ready to claim',
    statusQueued: 'Queued',
    queuePosition: (pos: number) => pos === 1 ? '#1 in waiting list' : `#${pos} in waiting list`,
    leaveWaitlist: 'Leave Waiting List',
    leaveWaitlistConfirm: 'Do you want to remove yourself from the waiting list for this slot?',
    handoverBooking: 'Hand over',
    handoverBookingBtn: (name: string) => `Hand over to ${name}`,
    handoverConfirm: (name: string, date: string) => `Do you want to transfer your reservation on ${date} directly to ${name}?`,
    handoverSuccess: (name: string) => `Booking successfully handed over to ${name}!`,
    whatsAppNudge: 'WhatsApp Inquiry',
    whatsAppNudgeText: (ownerName: string, date: string, slot: string) =>
      `Hey ${ownerName}! Are you definitely using the B-Mobil on ${date} (${slot}), or could I take it if you don't need it? Cheers!`,
    jumpToCalendarDay: 'View in Calendar',
    myWaitlistBanner: (count: number) => `You are on the waiting list for ${count} slot${count !== 1 ? 's' : ''}`,
    currentlyBookedBy: (name: string) => `Currently booked by ${name}`,
    someoneWaitingForCar: (name: string) => `${name} is waiting for this car slot`,
    noActiveWaitlist: 'No active waiting list requests',

    // Family
    familySettingsTitle: 'Family & Settings',
    familySettingsSubtitle: 'Manage family members, security, and app preferences.',
    activeProfile: 'Active Profile',
    switchBtn: 'Switch',
    appearance: 'Appearance',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    inviteCode: 'Family Invite Code',
    inviteCodeHint: 'Share this code with household members so they can join our car schedule.',
    copied: 'Copied',
    copyCode: 'Copy Code',
    whatsApp: 'WhatsApp',
    familyMembers: 'Family Members',
    addMember: 'Add Member',
    memberNamePlaceholder: 'Member Name (e.g. Leo)',
    badgeColor: 'Badge Color:',
    cancel: 'Cancel',
    saveMember: 'Save Member',
    restoreDataHint: 'Restore sample family data?',
    resetDemo: 'Reset Demo',
    resetConfirm: 'Reset sample family data?',
    signOut: 'Sign Out',
    signOutConfirm: 'Are you sure you want to sign out on this device?',

    // Security & Passcode
    familyPasscodeTitle: 'Family Access Gate',
    familyPasscodeDesc: 'Please enter the family passcode to access B-Mobil.',
    familyPasscodePlaceholder: 'Enter family passcode',
    familyPasscodeSubmit: 'Unlock Access',
    familyPasscodeError: 'Incorrect family passcode. Access denied.',
    personalPinTitle: 'Enter Your PIN',
    personalPinDesc: 'Enter your 4-digit security PIN to unlock your profile.',
    setPersonalPinTitle: 'Create 4-Digit PIN',
    setPersonalPinDesc: 'Set a 4-digit personal PIN to protect your profile on this device.',
    pinPlaceholder: '4-digit PIN',
    pinError: 'Incorrect PIN. Please try again.',
    passcodeSettingsTitle: 'Family Security Passcode',
    passcodeSettingsDesc: 'Security passcode required for all family devices to join.',

    // WhatsApp & Onboarding
    whatsAppInviteTitle: 'Invite via WhatsApp',
    whatsAppInviteDesc: 'Invite family members so they can book the car directly from their own phones.',
    whatsAppInviteBtn: 'Send WhatsApp Invite',
    whatsAppInviteText: (url: string, code: string) =>
      `Hey! Hier ist unser B-Mobil für die Familie: ${url}\nFamilien-Passcode: ${code}`,
    welcomeTitle: 'Welcome to B-Mobil',
    welcomeSubtitle: 'Reserve & share easily',
    yourName: 'Your Name',
    namePlaceholder: 'e.g. Moritz, Mom, Dad...',
    pickColor: 'Avatar Color',
    joinPoolBtn: 'Join B-Mobil',
    selectExistingProfile: 'Select your profile on this device:',
    cleanTestData: 'Clear Test Data (Start Fresh)',
    cleanTestDataDesc: 'Removes all sample bookings and starts fresh with a clean calendar.',
    cleanTestConfirm: 'Are you sure you want to clear test data and start fresh?',

    // PWA
    installAppTitle: 'Install as Mobile App',
    installAppDescIOS: 'Tap Share in Safari, then select "Add to Home Screen"',
    installAppDescOther: 'Install B-Mobil to your home screen for instant 1-tap scheduling.',
    installNow: 'Install Now',

    // Vehicle & Return Status
    carStatusTitle: 'Vehicle Status',
    available: 'Available',
    inUse: (name: string) => `In use (${name})`,
    nextTrip: 'Next trip:',
    batteryLevel: 'Battery Charge',
    fuelLevel: 'Fuel Level',
    parkedAt: 'Parked at',
    keys: 'Keys',
    updateStatusReturnBtn: 'Log Fuel / Return Car',
    returnCarTitle: 'Return Car & Update Status',
    returnCarSubtitle: 'Keep your family up to date on fuel and parking spot.',
    whereParked: 'Where is the car parked?',
    whereKeys: 'Where are the car keys?',
    saveVehicleStatus: 'Save & Notify Family',
    lowFuelWarning: 'Low fuel / battery – please refuel next trip!',
    presetLocationDriveway: 'Driveway in front of garage',
    presetLocationStreet: 'Street parking by house',
    presetLocationGarage: 'Inside garage',
    presetKeyHallway: 'Key hook in hallway',
    presetKeyKitchen: 'Kitchen counter bowl',
    presetKeyConsole: 'In car center console',

    // Pull-to-refresh & Offline
    pullToRefresh: 'Pull down to refresh',
    releaseToRefresh: 'Release to refresh',
    refreshing: 'Updating calendar...',
    updatedJustNow: 'Updated just now',
    offlineMode: 'Offline Mode – Changes sync when reconnected',

    // WhatsApp Sharing
    shareBookingWhatsApp: 'Share in WhatsApp',
    whatsAppBookingText: (name: string, date: string, time: string, note?: string) =>
      `🚗 B-Mobil: ${name} reserved the car for ${date} (${time})${note ? ` – ${note}` : ''}.`
  },
  de: {
    // Header
    appName: 'B-Mobil',
    appSubtitle: '',
    switchUser: 'Benutzer wechseln',
    admin: 'Admin',

    // Tabs
    tabSchedule: 'Kalender',
    tabAlerts: 'Hinweise',
    tabFamily: 'Familie',

    // Calendar
    today: 'Heute',
    prevDays: 'Vorherige 7 Tage',
    nextDays: 'Nächste 7 Tage',
    bookCar: 'Auto buchen',
    reserveDay: 'Diesen Tag buchen',
    carFreeAllDay: 'Auto den ganzen Tag frei',
    carFreeDescription: 'Noch keine Reservierungen an diesem Tag. Brauchst du das Auto? Mit wenigen Fingertipps reservieren.',
    confirmedReservations: (count: number) => `${count} bestätigte Reservierung${count > 1 ? 'en' : ''}`,
    carAvailableAllDay: 'Auto steht den ganzen Tag bereit',
    timelineTitle: '24h Verfügbarkeits-Zeitleiste',
    freeAllDay: 'Ganzer Tag frei',
    reservedBlocks: (count: number) => `${count} belegte${count > 1 ? ' Zeiträume' : 'r Zeitraum'}`,
    tapToBookFullDay: 'Tippen für Ganztagesbuchung',
    quickReserve: 'Schnellbuchung mit einem Tipp:',
    you: 'Du',
    cancelReservation: 'Reservierung stornieren',
    cancelConfirm: (name: string) => `Reservierung für ${name} wirklich stornieren?`,
    waitingListTitle: 'Warteliste an diesem Tag',
    readyToClaim: 'Auto wieder frei! Jetzt übernehmen.',
    claimSlot: 'Slot übernehmen',
    waitingAlert: (name: string, count: number) =>
      count === 1 ? `${name} wartet auf diesen Zeitraum` : `${count} Familienmitglieder warten`,
    waitingAlertOwner: 'Falls sich deine Pläne geändert haben, gibst du das Auto durch Stornieren sofort frei!',
    waitingAlertOther: 'Du wirst sofort benachrichtigt, sobald diese Reservierung storniert wird.',

    // Slots
    slotFullDay: 'Ganzer Tag',
    slotFullDaySub: 'Ganztägig',
    slotMorning: 'Vormittag',
    slotMorningSub: '08:00 – 13:00',
    slotAfternoon: 'Nachmittag',
    slotAfternoonSub: '13:00 – 18:00',
    slotEvening: 'Abend',
    slotEveningSub: '18:00 – 23:00',
    slotCustom: 'Individuelle Zeiten',
    slotCustomBtn: 'Eigene Uhrzeiten festlegen',

    // Booking Modal
    reserveCarModalTitle: 'Auto reservieren',
    reservingAs: 'Reservieren als',
    reservationDate: 'Buchungsdatum',
    timeBlock: 'Zeitraum',
    from: 'Von',
    until: 'Bis',
    tripReasonLabel: 'Fahrtgrund / Ziel (Optional)',
    tripReasonPlaceholder: 'z.B. Wocheneinkauf, Fußballtraining, Arzttermin',
    conflictTitle: 'Auto bereits reserviert',
    conflictText: (name: string, date: string, slot: string) =>
      `${name} hat das Auto am ${date} (${slot}) bereits gebucht.`,
    conflictHint: (name: string) =>
      `Setze dich unten auf die Warteliste. ${name} wird sofort benachrichtigt.`,
    joinWaitingList: 'Auf Warteliste setzen',
    confirmReservation: 'Reservierung bestätigen',
    confirmMultiReservation: (count: number) => `${count} Tage reservieren`,
    alreadyBookedByYou: 'Du hast diesen Zeitraum bereits reserviert.',
    alreadyBookedByYouSub: 'Um deine Reservierung zu ändern, storniere bitte die bestehende oder wähle eine andere Zeit.',
    alreadyReservedBtn: 'Bereits von dir reserviert',

    // Multi-day booking
    multiDayToggle: 'Mehrere Tage auswählen',
    multiDaySelected: (count: number) =>
      count === 1 ? '1 Tag für diese Fahrt ausgewählt' : `${count} Tage für diese Fahrt ausgewählt`,
    multiDayHint: 'Tippe unten weitere Tage an, um alle mit den gleichen Zeiten & Gründen zu buchen:',

    // Alerts
    activityAlerts: 'Aktivität & Hinweise',
    totalUpdates: (count: number) => `${count} Benachrichtigung${count !== 1 ? 'en' : ''}`,
    markAllRead: 'Alle als gelesen markieren',
    allCaughtUp: 'Alles auf dem neuesten Stand',
    allCaughtUpSub: 'Hier erhältst du sofortige Updates, wenn jemand das Auto anfragt oder freigibt.',
    claimCarSlot: 'Diesen Zeitraum übernehmen',
    activeFamilyWaitlist: 'Aktive Familien-Warteliste',
    waitingFor: (date: string, slot: string) => `wartet auf ${date} (${slot})`,
    statusOffered: 'Bereit zur Übernahme',
    statusQueued: 'In Warteschlange',
    queuePosition: (pos: number) => pos === 1 ? 'Platz 1 in der Warteliste' : `Platz ${pos} in der Warteliste`,
    leaveWaitlist: 'Warteliste verlassen',
    leaveWaitlistConfirm: 'Möchtest du deinen Eintrag auf der Warteliste für diesen Termin entfernen?',
    handoverBooking: 'Übergeben',
    handoverBookingBtn: (name: string) => `An ${name} übergeben`,
    handoverConfirm: (name: string, date: string) => `Möchtest du deine Reservierung am ${date} direkt an ${name} übergeben?`,
    handoverSuccess: (name: string) => `Buchung erfolgreich an ${name} übergeben!`,
    whatsAppNudge: 'WhatsApp Nachfrage',
    whatsAppNudgeText: (ownerName: string, date: string, slot: string) =>
      `Hey ${ownerName}! Brauchst du das B-Mobil am ${date} (${slot}) sicher, oder könnte ich es haben falls deine Pläne sich ändern? Liebe Grüße!`,
    jumpToCalendarDay: 'Im Kalender anzeigen',
    myWaitlistBanner: (count: number) => `Du stehst für ${count} Termin${count !== 1 ? 'e' : ''} auf der Warteliste`,
    currentlyBookedBy: (name: string) => `Aktuell reserviert von ${name}`,
    someoneWaitingForCar: (name: string) => `${name} wartet auf dieses Auto`,
    noActiveWaitlist: 'Keine aktiven Wartelisten-Anfragen',

    // Family
    familySettingsTitle: 'Familie & Einstellungen',
    familySettingsSubtitle: 'Familienmitglieder, Sicherheit und App-Einstellungen verwalten.',
    activeProfile: 'Aktives Profil',
    switchBtn: 'Wechseln',
    appearance: 'Erscheinungsbild',
    lightMode: 'Hell',
    darkMode: 'Dunkel',
    language: 'Sprache',
    inviteCode: 'Familien-Einladungscode',
    inviteCodeHint: 'Teile diesen Code mit Familienmitgliedern, damit sie dem Auto-Plan beitreten können.',
    copied: 'Kopiert',
    copyCode: 'Code kopieren',
    whatsApp: 'WhatsApp',
    familyMembers: 'Familienmitglieder',
    addMember: 'Mitglied hinzufügen',
    memberNamePlaceholder: 'Name (z.B. Leo)',
    badgeColor: 'Kennfarbe:',
    cancel: 'Abbrechen',
    saveMember: 'Mitglied speichern',
    restoreDataHint: 'Beispieldaten wiederherstellen?',
    resetDemo: 'Zurücksetzen',
    resetConfirm: 'Beispieldaten der Familie zurücksetzen?',
    signOut: 'Abmelden',
    signOutConfirm: 'Möchtest du dich wirklich von diesem Gerät abmelden?',

    // Security & Passcode
    familyPasscodeTitle: 'Familien-Zugang',
    familyPasscodeDesc: 'Bitte gib das Familien-Passwort ein, um B-Mobil zu öffnen.',
    familyPasscodePlaceholder: 'Familien-Passwort eingeben',
    familyPasscodeSubmit: 'Zugang entsperren',
    familyPasscodeError: 'Falsches Familien-Passwort. Zugriff verweigert.',
    personalPinTitle: 'PIN eingeben',
    personalPinDesc: 'Gib deine 4-stellige Sicherheits-PIN ein, um dein Profil zu entsperren.',
    setPersonalPinTitle: '4-stellige PIN festlegen',
    setPersonalPinDesc: 'Wähle eine 4-stellige PIN, um dein Profil auf diesem Gerät zu schützen.',
    pinPlaceholder: '4-stellige PIN',
    pinError: 'Falsche PIN. Bitte erneut versuchen.',
    passcodeSettingsTitle: 'Familien-Sicherheitspasswort',
    passcodeSettingsDesc: 'Sicherheitscode, den alle Familiengeräte zum Beitreten benötigen.',

    // WhatsApp & Onboarding
    whatsAppInviteTitle: 'Per WhatsApp einladen',
    whatsAppInviteDesc: 'Lade Familienmitglieder ein, damit sie das Auto direkt vom eigenen Handy reservieren können.',
    whatsAppInviteBtn: 'WhatsApp Einladung senden',
    whatsAppInviteText: (url: string, code: string) =>
      `Hey! Hier ist unser B-Mobil für die Familie: ${url}\nFamilien-Passcode: ${code}`,
    welcomeTitle: 'Willkommen beim B-Mobil',
    welcomeSubtitle: 'Einfach reservieren & teilen',
    yourName: 'Dein Name',
    namePlaceholder: 'z.B. Moritz, Mama, Papa...',
    pickColor: 'Deine Profilfarbe',
    joinPoolBtn: 'B-Mobil beitreten',
    selectExistingProfile: 'Wähle dein Profil auf diesem Gerät:',
    cleanTestData: 'Testdaten leeren (Neustart)',
    cleanTestDataDesc: 'Löscht alle Beispielbuchungen für einen sauberen Kalender-Neustart.',
    cleanTestConfirm: 'Möchtest du wirklich alle Testdaten löschen und sauber starten?',

    // PWA
    installAppTitle: 'Als App installieren',
    installAppDescIOS: 'In Safari auf "Teilen" tippen, dann "Zum Home-Bildschirm"',
    installAppDescOther: 'Füge das B-Mobil zum Home-Bildschirm für schnellen 1-Tipp-Zugriff hinzu.',
    installNow: 'Jetzt installieren',

    // Vehicle & Return Status
    carStatusTitle: 'Fahrzeug-Status',
    available: 'Frei & Bereit',
    inUse: (name: string) => `Unterwegs (${name})`,
    nextTrip: 'Nächste Fahrt:',
    batteryLevel: 'Akkuladestand',
    fuelLevel: 'Tankstand',
    parkedAt: 'Geparkt',
    keys: 'Schlüssel',
    updateStatusReturnBtn: 'Tanken / Fahrt beenden',
    returnCarTitle: 'Fahrt beenden & Status melden',
    returnCarSubtitle: 'Halte die Familie über Tank und Standort auf dem Laufenden.',
    whereParked: 'Wo steht das Auto?',
    whereKeys: 'Wo liegen die Schlüssel?',
    saveVehicleStatus: 'Speichern & Familie informieren',
    lowFuelWarning: 'Niedriger Tankstand / Akku – bitte bald nachtanken!',
    presetLocationDriveway: 'Einfahrt vor der Garage',
    presetLocationStreet: 'Straße vorm Haus',
    presetLocationGarage: 'In der Garage',
    presetKeyHallway: 'Schlüsselbrett im Flur',
    presetKeyKitchen: 'Schale in der Küche',
    presetKeyConsole: 'Mittelkonsole im Auto',

    // Pull-to-refresh & Offline
    pullToRefresh: 'Zum Aktualisieren nach unten ziehen',
    releaseToRefresh: 'Loslassen zum Aktualisieren',
    refreshing: 'Kalender wird aktualisiert...',
    updatedJustNow: 'Gerade aktualisiert',
    offlineMode: 'Offline-Modus – Synchronisiert automatisch bei Verbindung',

    // WhatsApp Sharing
    shareBookingWhatsApp: 'In WhatsApp teilen',
    whatsAppBookingText: (name: string, date: string, time: string, note?: string) =>
      `🚗 B-Mobil: ${name} hat das Auto für ${date} (${time}) reserviert${note ? ` – ${note}` : ''}.`
  }
};

export const getDateLocale = (lang: Language) => {
  return lang === 'de' ? deLocale : enLocale;
};
