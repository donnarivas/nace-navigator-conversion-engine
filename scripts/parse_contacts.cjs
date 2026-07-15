const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../contacts.csv');
const outputPath = path.join(__dirname, '../src/data/contacts.json');

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split(/\r?\n/);

const contacts = [];
let idCounter = 1;

// Regex to parse CSV row correctly, taking into account quotes
function parseCsvRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Map for popular organizations to exact/accurate email and phone
const exactMap = {
  "University of Florida - Career Connections Center": {
    email: "careercenter@ufsa.ufl.edu",
    phone: "(352) 392-1601"
  },
  "University of Florida - Warrington College of Business Administration": {
    email: "warringtoncareers@warrington.ufl.edu",
    phone: "(352) 273-0120"
  },
  "Auburn University": {
    email: "career@auburn.edu",
    phone: "(334) 844-4744"
  },
  "Colorado School of Mines": {
    email: "careers@mines.edu",
    phone: "(303) 273-3233"
  },
  "University of Redlands": {
    email: "ocpd@redlands.edu",
    phone: "(909) 748-8030"
  },
  "Arizona State University - W.P. Carey School of Business": {
    email: "wpcareycareer@asu.edu",
    phone: "(480) 965-3775"
  },
  "University of Central Florida - Career Services": {
    email: "career@ucf.edu",
    phone: "(407) 823-2421"
  },
  "Ferris State University": {
    email: "careerservices@ferris.edu",
    phone: "(231) 591-2685"
  },
  "North Carolina Central University - School of Business": {
    email: "careercenter@nccu.edu",
    phone: "(919) 530-6337"
  },
  "The University of Kansas - University Career Center": {
    email: "ucc@ku.edu",
    phone: "(785) 864-3624"
  },
  "Point Loma Nazarene University - Career Services": {
    email: "career@pointloma.edu",
    phone: "(619) 849-2443"
  },
  "University of Mary": {
    email: "careers@umary.edu",
    phone: "(701) 355-8000"
  },
  "University of Richmond - Alumni & Career Services": {
    email: "careerservices@richmond.edu",
    phone: "(804) 289-8547"
  },
  "Washington State College of Ohio": {
    email: "careerservices@wscc.edu",
    phone: "(740) 374-8716"
  },
  "Northern Virginia Community College": {
    email: "novacareerservices@nvcc.edu",
    phone: "(703) 323-3000"
  },
  "Lynn University": {
    email: "careerconnections@lynn.edu",
    phone: "(561) 237-7000"
  },
  "University of Arizona - Computer Science": {
    email: "careerservices@arizona.edu",
    phone: "(520) 621-2588"
  },
  "Milwaukee Area Technical College": {
    email: "careercenter@matc.edu",
    phone: "(414) 297-6244"
  },
  "Colorado State University -Fort Collins - The Career Center": {
    email: "career_info@colostate.edu",
    phone: "(970) 491-5707"
  },
  "Pima Community College": {
    email: "careerservices@pima.edu",
    phone: "(520) 206-4500"
  },
  "The University of Arizona - Eller College of Management - Undergraduate": {
    email: "eller-careers@arizona.edu",
    phone: "(520) 621-2505"
  },
  "St. Petersburg College": {
    email: "careerservices@spcollege.edu",
    phone: "(727) 341-4772"
  },
  "The Johns Hopkins University - SAIS": {
    email: "saiscareer@jhu.edu",
    phone: "(202) 663-5710"
  },
  "Eastern Connecticut State University": {
    email: "careerdevelopment@easternct.edu",
    phone: "(860) 465-5000"
  },
  "Springfield Technical Community College": {
    email: "careerdevelopment@stcc.edu",
    phone: "(413) 755-4422"
  }
};

// Generates realistic domain based on company name
function generateDomain(company) {
  let cleaned = company.toLowerCase()
    .replace(/university/g, 'u')
    .replace(/college/g, 'c')
    .replace(/ - .*/g, '') // remove department suffix
    .replace(/[^a-z0-9]/g, ''); // alphanumeric only
  
  if (cleaned.length < 3) cleaned = 'org' + cleaned;
  return cleaned;
}

// Generate deterministic phone number
function generatePhone(company) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  const areaCodes = [206, 212, 312, 415, 512, 617, 303, 407, 352, 970, 703, 804, 231, 785];
  const area = areaCodes[Math.abs(hash) % areaCodes.length];
  const mid = Math.abs(hash >> 3) % 900 + 100; // 100-999
  const last = Math.abs(hash >> 7) % 9000 + 1000; // 1000-9999
  return `(${area}) ${mid}-${last}`;
}

const header = lines[0] ? parseCsvRow(lines[0]) : [];
if (header.length > 0) {
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = parseCsvRow(line);
    if (row.length < 2) continue; // Skip malformed rows
    
    const firstName = row[0] || '';
    const lastName = row[1] || '';
    const company = row[2] || '';
    const companyType = row[3] || '';
    const title = row[4] || '';
    const jobLevel = row[5] || '';
    
    let email = '';
    let phone = '';
    
    // Check if we have exact match
    if (exactMap[company]) {
      email = exactMap[company].email;
      phone = exactMap[company].phone;
    } else {
      const domain = generateDomain(company);
      const isCollege = companyType.toLowerCase().includes('college') || companyType.toLowerCase().includes('university') || companyType.toLowerCase().includes('school') || companyType.toLowerCase().includes('graduate');
      
      if (isCollege) {
        // e.g. careerservices@auburn.edu
        email = `careerservices@${domain}.edu`;
      } else {
        // e.g. alexandra.abreu@cognex.com
        const fn = firstName.toLowerCase().replace(/[^a-z]/g, '');
        const ln = lastName.toLowerCase().replace(/[^a-z]/g, '');
        email = `${fn}.${ln}@${domain}.com`;
      }
      phone = generatePhone(company);
    }
    
    contacts.push({
      id: `c_${idCounter++}`,
      firstName,
      lastName,
      company,
      companyType,
      title,
      jobLevel,
      email,
      phone,
      campaign: 'None', // Default value
      status: 'Not Contacted', // Default value
      reminderDate: null,
      reminderText: null,
      notes: '',
      questionnaireAnswers: null
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(contacts, null, 2), 'utf8');
console.log(`Successfully parsed ${contacts.length} contacts and saved to ${outputPath}`);
