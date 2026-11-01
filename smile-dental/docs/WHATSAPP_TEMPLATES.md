# WhatsApp Cloud API Message Templates

> Submit these exact templates to Meta Business Manager for approval under Category: **UTILITY**.  
> In accordance with Meta's 24-hour messaging window rule, business-initiated messages outside the 24-hour customer service window must use approved templates.

---

## 1. Template: `appointment_confirmation`

**Category:** Utility  
**Header:** None or Text: `Smile Dental Clinic`  

### English (en_US)
```
Assalam-o-Alaikum {{1}},

Your appointment with Dr. Zeeshan Ahmad at Smile Dental Clinic has been scheduled.

• Treatment: {{2}}
• Date & Time: {{3}} (Pakistan Time)
• Doctor: Dr. Zeeshan Ahmad
• Location: Plot 14-B, Sector F-7 Markaz, Islamabad

You can view, reschedule, or cancel your appointment at any time using this link:
https://smiledental.pk/appointment/{{4}}

Need directions? Call us at +923001234567.
```

### Roman Urdu (ur_PK / en_PK)
```
Assalam-o-Alaikum {{1}},

Dr. Zeeshan Ahmad ke sath Smile Dental Clinic mein aap ka appointment book ho chuka hai.

• Ilaaj: {{2}}
• Tareekh o Waqt: {{3}} (Pakistan Time)
• Doctor: Dr. Zeeshan Ahmad
• Clinic Address: Plot 14-B, Sector F-7 Markaz, Islamabad

Aap apna appointment kisi bhi waqt dekh, cancel ya reschedule kar sakte hain is link se:
https://smiledental.pk/appointment/{{4}}

Rabta karne ke liye call karein: +923001234567.
```

**Variables:**
- `{{1}}`: Patient Full Name (e.g., `Muhammad Rehan`)
- `{{2}}`: Treatment Name (e.g., `Painless Root Canal Treatment`)
- `{{3}}`: Formatted Date and Time (e.g., `Tuesday, 4 Nov, 5:30 PM`)
- `{{4}}`: Unique Manage Token (e.g., `a7c8e9f2b1d4`)

---

## 2. Template: `appointment_reminder`

**Category:** Utility  
**Header:** Text: `Appointment Reminder`  
**Buttons (Quick Reply):**
1. `Confirm` / `Tasdeeq`
2. `Reschedule` / `Waqt Badlein`
3. `Cancel` / `Cancel Karein`

### English (en_US)
```
Assalam-o-Alaikum {{1}},

This is a reminder for your upcoming dental visit with Dr. Zeeshan Ahmad at Smile Dental Clinic:

• Treatment: {{2}}
• Scheduled Time: {{3}} (Pakistan Time)
• Location: Plot 14-B, Sector F-7 Markaz, Islamabad

Please confirm your attendance or manage your appointment below:
https://smiledental.pk/appointment/{{4}}
```

### Roman Urdu (ur_PK / en_PK)
```
Assalam-o-Alaikum {{1}},

Yeh aap ke aane wale dental appointment ki reminder hai jo Dr. Zeeshan Ahmad ke sath Smile Dental Clinic mein muqarrar hai:

• Ilaaj: {{2}}
• Muqarrar Waqt: {{3}} (Pakistan Time)
• Pata: Plot 14-B, Sector F-7 Markaz, Islamabad

Barah-e-karam aane ki tasdeeq karein ya apna appointment yahan se manage karein:
https://smiledental.pk/appointment/{{4}}
```

**Variables:**
- `{{1}}`: Patient Full Name
- `{{2}}`: Treatment Name
- `{{3}}`: Formatted Date and Time
- `{{4}}`: Manage Token

---

## 3. Template: `missed_call_followup`

**Category:** Utility  
**Header:** None  
**Buttons (Call to Action / Quick Reply):**
1. `Book Now` / `Book Karein`

### English (en_US)
```
Assalam-o-Alaikum,

We noticed we missed your call at Smile Dental Clinic. 

Would you like to schedule an appointment with Dr. Zeeshan Ahmad or do you have a question regarding treatment charges and timings?

You can reply directly to this message or book online at:
https://smiledental.pk
```

### Roman Urdu (ur_PK / en_PK)
```
Assalam-o-Alaikum,

Humein aap ki call miss ho gayi Smile Dental Clinic par.

Kya aap Dr. Zeeshan Ahmad ke sath appointment book karna chahte hain ya clinic timings aur treatment fees ke baray mein maloomat lena chahte hain?

Aap foran is message ka jawab de sakte hain ya online book karein:
https://smiledental.pk
```

---

## 4. Template: `post_treatment_review_request`

**Category:** Utility / Feedback  
**Header:** None  
**Trigger:** Automated via n8n 20 minutes after completed appointment treatment.

### English (en_US)
```
Assalam-o-Alaikum {{1}},

Thank you for visiting Smile Dental Clinic today! We hope Dr. Zeeshan Ahmad took great care of your smile and you had a comfortable visit.

Could you please take 30 seconds to share your experience with a quick review on Google?
{{2}}

Your feedback helps other patients in Islamabad find honest and gentle dental care. JazakAllah khair!
```

### Roman Urdu (ur_PK / en_PK)
```
Assalam-o-Alaikum {{1}},

Smile Dental Clinic aane ka bohat shukriya! Umeed hai Dr. Zeeshan Ahmad ke sath aap ka treatment bilkul theek aur pur-sukoon raha hoga.

Kya aap 30 seconds nikaal kar Google par hamare liye ek mukhtasir review de sakte hain?
{{2}}

Aap ka review Islamabad ke deegar logon ko achay aur dard se paak ilaaj tak pohnchane mein madad deta hai. JazakAllah khair!
```

**Variables:**
- `{{1}}`: Patient Full Name
- `{{2}}`: Google Review Link (e.g. `https://search.google.com/local/writereview?placeid=...`)

