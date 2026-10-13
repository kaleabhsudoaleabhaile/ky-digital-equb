let members = JSON.parse(localStorage.getItem("ky_members")) || [];
const BOT_TOKEN = "8993924043:AAHtYJM0TBJJm7wM1VAe4Yd0vNPj6pNtc0o";
const CHANNEL_USERNAME = "@ky_digital_equb_channel";

function sendTelegramNotification(message) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHANNEL_USERNAME, text: message, parse_mode: "Markdown" })
    });
}

function renderMembers() {
    const tbody = document.getElementById("membersList");
    if (!tbody) return;
    tbody.innerHTML = "";
    members.forEach((m, index) => {
        if (!m.days || m.days.length !== 5) m.days = [false, false, false, false, false];
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${m.name}</strong></td>
            <td>${m.gender || 'ወንድ'}</td>
            <td><strong>50 ብር</strong></td>
            <td><input type="checkbox" ${m.days[0] ? 'checked' : ''} onclick="toggleDay(${index}, 0)"></td>
            <td><input type="checkbox" ${m.days[1] ? 'checked' : ''} onclick="toggleDay(${index}, 1)"></td>
            <td><input type="checkbox" ${m.days[2] ? 'checked' : ''} onclick="toggleDay(${index}, 2)"></td>
            <td><input type="checkbox" ${m.days[3] ? 'checked' : ''} onclick="toggleDay(${index}, 3)"></td>
            <td><input type="checkbox" ${m.days[4] ? 'checked' : ''} onclick="toggleDay(${index}, 4)"></td>
            <td>${m.won ? '🏆 የወጣለት' : '-'}</td>
            <td><button class="btn btn-danger" onclick="deleteMember(${index})">አጥፋ</button></td>
        `;
        tbody.appendChild(tr);
    });
    const totalEl = document.getElementById("totalMembersCount");
    if (totalEl) totalEl.innerText = members.length;
    localStorage.setItem("ky_members", JSON.stringify(members));
}

function drawEqub() {
    if (members.length === 0) {
        alert("⚠️ ምንም የተመዘገበ አባል የለም!");
        return;
    }
    
    // 🔴 100% ሁሉም አባላት ቲክ ካልተደረጉ Spin እንዳያደርግ መከልከል
    const paidMembers = members.filter(m => m.days && m.days[0] === true);
    
    if (paidMembers.length < members.length) {
        const missing = members.length - paidMembers.length;
        alert(`⚠️ እጣ ማውጣት አይቻልም! ያልከፈሉ/ቲክ ያልተደረጉ ${missing} አባላት አሉ:: እጣ ለማውጣት ሁሉም ${members.length} አባላት ቲክ መደረግ አለባቸው!`);
        return;
    }

    const eligible = paidMembers.filter(m => !m.won);
    if (eligible.length === 0) {
        alert("⚠️ ለሁሉም አባላት ዕጣ ወጥቷል!");
        return;
    }

    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const idx = members.findIndex(m => m.name === winner.name);
    if (idx !== -1) members[idx].won = true;

    renderMembers();
    
    const genderText = winner.gender === 'ሴት' ? "ዕጣው የወጣላት" : "ዕጣው የወጣለት";
    sendTelegramNotification(`🎉 *K Y Digital Equb - Live Draw Result* 🎉\n\nየዛሬው ዘር ዕጣ አሸናፊ:\n👤 ${genderText}: *${winner.name}*\n💵 የዕቁብ ክፍያ መጠን: 50 ብር\n🏆 አጠቃላይ ድምር: 25,000 ብር\n\nእንኳን ደስ አላችሁ! 🎊 K Y Digital Equb`);
    
    const winnerDisplay = document.getElementById("winnerNameDisplay");
    if (winnerDisplay) winnerDisplay.innerText = winner.name;
    
    alert(`🎉 አሸናፊ: ${winner.name}`);
}

function toggleDay(mIdx, dIdx) {
    members[mIdx].days[dIdx] = !members[mIdx].days[dIdx];
    renderMembers();
}

function deleteMember(idx) {
    if (confirm("እርግጠኛ ነዎት ይህንን አባል ማጥፋት ይፈልጋሉ?")) {
        members.splice(idx, 1);
        renderMembers();
    }
}

function addMember() {
    const nameInput = document.getElementById("memberNameInput");
    const genderInput = document.getElementById("memberGenderInput");
    if (!nameInput) return;
    const name = nameInput.value.trim();
    const gender = genderInput ? genderInput.value : "ወንድ";
    
    if (!name) return alert("እባክዎን ስም ያስገቡ!");
    
    members.push({ name, gender, days: [false, false, false, false, false], won: false });
    nameInput.value = "";
    renderMembers();
}

document.addEventListener("DOMContentLoaded", renderMembers);
