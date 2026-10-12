// LocalStorage መረጃዎችን ማምጣት
let members = JSON.parse(localStorage.getItem("ky_members")) || [];

const BOT_TOKEN = "8993924043:AAHt8As81H2J72M6QDkQE6K_gWISzmR8sms";
const CHANNEL_USERNAME = "@ky_digital_equb_channel"; 

// ወደ ቴሌግራም ቻናል መልእክት መላኪያ ፊንክሽን
function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const data = {
    chat_id: CHANNEL_USERNAME,
    text: message,
    parse_mode: "Markdown"
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log("Telegram API Response: ", result);
    if (result.ok) {
      alert("✅ አሸናፊው በቴሌግራም ቻናል ላይ በስኬት ተፖስቷል!");
    } else {
      alert("❌ የቴሌግራም ስህተት: " + result.description);
    }
  })
  .catch(error => {
    console.error("Fetch Error: ", error);
    alert("❌ የኔትወርክ ስህተት ተፈጥሯል!");
  });
}

// የአባላትን ዝርዝር ማሳያ (ፆታን ጨምሮ)
function renderMembers() {
  const tbody = document.getElementById("membersList");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  members.forEach((m, index) => {
    if (!m.days || m.days.length !== 5) {
      m.days = [false, false, false, false, false];
    }
    m.amount = "50 ብር";
    if (!m.gender) m.gender = "ወንድ"; // ነባሪ (Default)

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td>${m.gender}</td>
      <td><strong>50 ብር</strong></td>
      <td><input type="checkbox" class="day-checkbox" ${m.days[0] ? 'checked' : ''} onclick="toggleDay(${index}, 0)"></td>
      <td><input type="checkbox" class="day-checkbox" ${m.days[1] ? 'checked' : ''} onclick="toggleDay(${index}, 1)"></td>
      <td><input type="checkbox" class="day-checkbox" ${m.days[2] ? 'checked' : ''} onclick="toggleDay(${index}, 2)"></td>
      <td><input type="checkbox" class="day-checkbox" ${m.days[3] ? 'checked' : ''} onclick="toggleDay(${index}, 3)"></td>
      <td><input type="checkbox" class="day-checkbox" ${m.days[4] ? 'checked' : ''} onclick="toggleDay(${index}, 4)"></td>
      <td>${m.won ? '🎉 የወጣለት' : 'ያልወጣለት'}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteMember(${index})">ሰርዝ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const totalEl = document.getElementById("totalMembersCount");
  if (totalEl) totalEl.innerText = members.length;
  
  localStorage.setItem("ky_members", JSON.stringify(members));
}

// አዲስ አባል መመዝገቢያ (ከፆታ ምርጫ ጋር)
function addMember() {
  const nameInput = document.getElementById("memberNameInput");
  const genderInput = document.getElementById("memberGenderInput");

  const name = nameInput.value.trim();
  const gender = genderInput.value;

  if (!name) {
    alert("እባክዎ የአባሉን ስም ያስገቡ!");
    return;
  }

  if (members.length >= 100) {
    alert("እስከ 100 አባላት ብቻ መመዝገብ ይቻላል!");
    return;
  }

  members.push({
    name: name,
    gender: gender,
    amount: "50 ብር",
    days: [false, false, false, false, false],
    won: false
  });

  nameInput.value = "";
  renderMembers();
}

// የዕቁብ ቀን ሳጥን ሲነካ
function toggleDay(memberIndex, dayIndex) {
  members[memberIndex].days[dayIndex] = !members[memberIndex].days[dayIndex];
  
  const allChecked = members[memberIndex].days.every(d => d === true);
  
  if (allChecked) {
    alert(`🎉 እንኳን ደስ አለዎት! ${members[memberIndex].name} የ 5ቱን ቀናት ዑደት አጠናቋል! ሳጥኖቹ እንደ አዲስ ይጸዳሉ።`);
    members[memberIndex].days = [false, false, false, false, false];
    members[memberIndex].won = false;
  }

  renderMembers();
}

// አባል ከዝርዝር ማጥፊያ
function deleteMember(index) {
  if (confirm("ይህንን አባል ከዕቁቡ ማጥፋት ይፈልጋሉ?")) {
    members.splice(index, 1);
    renderMembers();
  }
}

// እጣ ማውጫ እና ፆታን ለይቶ (ዕጣው የወጣለት / ዕጣው የወጣላት) መልእክት መላኪያ
function triggerLiveSpin() {
  const eligible = members.filter(m => m.days.some(d => d === true) && !m.won);
  if (eligible.length === 0) {
    alert("እጣ የሚወጣላቸው ቢያንስ አንድ ቀን ክፍያ የፈጸሙ እና ገና እጣ ያልወጣላቸው አባላት የሉም!");
    return;
  }

  const spinBtn = document.getElementById("spinBtn");
  const winnerText = document.getElementById("winnerText");
  if (spinBtn) spinBtn.disabled = true;

  let counter = 0;
  const interval = setInterval(() => {
    const tempName = eligible[Math.floor(Math.random() * eligible.length)].name;
    winnerText.innerHTML = `🔄 በማሽከርከር ላይ... <br><strong>${tempName}</strong>`;
    counter++;

    if (counter > 20) {
      clearInterval(interval);
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      winner.won = true;
      
      // እንደ ፆታው "ወጣለት" ወይም "ወጣላት" የሚለውን መምረጥ
      const genderLabel = winner.gender === "ሴት" ? "ዕጣው የወጣላት" : "ዕጣው የወጣለት";

      winnerText.innerHTML = `🎉 እንኳን ደስ አለዎት! የዚህ ዙር አሸናፊ፦ <br><span style="color: var(--accent); font-size: 1.3rem;">${winner.name}</span>`;
      if (spinBtn) spinBtn.disabled = false;
      
      // ወደ ቴሌግራም ቻናል የሚላከው መልእክት
      const telegramMsg = `🎉 *K Y Digital Equb - Live Draw Result* 🎉\n\nየዛሬው ዙር ዕጣ አሸናፊ:\n👤  ${genderLabel} : ${winner.name}\n💰 የዕቁብ ክፍያ መጠን: 50 ብር (ለአንድ ቀን)\n🏆 አጠቃላይ የዕቁብ ድምር (Prize Pool): 25,000 ብር\n\nእንኳን ደስ አለዎት! 🎊 KY Digital Equb`;
      
      sendTelegramNotification(telegramMsg);

      renderMembers();
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  renderMembers();
});
