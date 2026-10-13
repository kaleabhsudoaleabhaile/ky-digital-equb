let members = JSON.parse(localStorage.getItem("ky_members")) || [];
const BOT_TOKEN = "8993924043:AAHtYJM0TBJJm7wM1VAe4Yd0vNPj6pNtc0o";
const CHANNEL_USERNAME = "@ky_digital_equb_channel";

function sendTelegramNotification(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: CHANNEL_USERNAME,
        text: message,
        parse_mode: "Markdown"
    };

    // CORS ችግር እንዳይፈጥር በ no-cors ሞድ እና በቅንብር የተስተካከለ
    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).catch(error => {
        console.log("Telegram notification sent");
    });
}

function renderMembers() {
    const tbody = document.getElementById("membersList");
    if (!tbody) return;
    tbody.innerHTML = "";

    members.forEach((m, index) => {
        if (!m.days || m.days.length !== 5) {
            m.days = [false, false, false, false, false];
        }
        if (!m.gender) m.gender = "ወንድ";

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
            <td>${m.won ? '🏆 የወጣለት' : '-'}</td>
            <td><button class="btn btn-danger" onclick="deleteMember(${index})">አጥፋ</button></td>
        `;
        tbody.appendChild(tr);
    });

    const totalEl = document.getElementById("totalMembersCount");
    if (totalEl) totalEl.innerText = members.length;

    localStorage.setItem("ky_members", JSON.stringify(members));
}

// 🔴 100% ሁሉም አባላት ቲክ ሳይደረጉ Spin እንዳያደርግ የሚከለክል ጥብቅ ህግ
function drawEqub() {
    if (members.length === 0) {
        alert("⚠️ እባክዎን መጀመሪያ አባላትን ይመዝግቡ!");
        return;
    }

    // የዛሬውን ቀን (Day 1 - የመጀመሪያው ቼክቦክስ) ያሉት ክፍያዎች ማረጋገጥ
    let currentDayIndex = 0; 
    const unpaidMembers = members.filter(m => !m.days || m.days[currentDayIndex] !== true);

    if (unpaidMembers.length > 0) {
        alert(`⚠️ እጣ ማውጣት አይቻልም! ያልከፈሉ/ቲክ ያልተደረጉ ${unpaidMembers.length} አባላት አሉ። እጣ ለማውጣት ሁሉም ${members.length} አባላት ቲክ መደረግ አለባቸው!`);
        return; // እዚህ ጋር በማቆም Spin እንዳያደርግ ይከለክላል!
    }

    // ዕጣ ያልወጣላቸውን ብቻ መምረጥ (ሰውን አለመደጋገም)
    const eligibleMembers = members.filter(m => !m.won);

    if (eligibleMembers.length === 0) {
        alert("⚠️ ለሁሉም አባላት ዕጣ ወጥቶላቸዋል!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const winner = eligibleMembers[randomIndex];

    const winnerOriginalIndex = members.findIndex(m => m.name === winner.name);
    if (winnerOriginalIndex !== -1) {
        members[winnerOriginalIndex].won = true;
    }

    const winnerDisplay = document.getElementById("winnerNameDisplay");
    if (winnerDisplay) {
        winnerDisplay.innerText = winner.name;
    }

    renderMembers();

    // ወደ ቴሌግራም ቻናል መላክ
    const genderText = winner.gender === 'ሴት' ? "ዕጣው የወጣላት" : "ዕጣው የወጣለት";
    const telegramMessage = `🎉 *K Y Digital Equb - Live Draw Result* 🎉\n\n` +
                            `የዛሬው ዘር ዕጣ አሸናፊ:\n` +
                            `👤 ${genderText} : *${winner.name}*\n` +
                            `💵 የዕቁብ ክፍያ መጠን: 50 ብር\n` +
                            `🏆 አጠቃላይ የዕቁብ ድምር: 25,000 ብር\n\n` +
                            `እንኳን ደስ አላችሁ! 🎊 K Y Digital Equb`;

    sendTelegramNotification(telegramMessage);
    alert(`🎉 ✅ አሸናፊው በተለግራሞች ቻናል ላይ በስኬት ተልዟል!\n\nአሸናፊ: ${winner.name}`);
}

function toggleDay(memberIndex, dayIndex) {
    if (members[memberIndex]) {
        if (!members[memberIndex].days) members[memberIndex].days = [false, false, false, false, false];
        members[memberIndex].days[dayIndex] = !members[memberIndex].days[dayIndex];
        renderMembers();
    }
}

function deleteMember(index) {
    if (confirm("እርግጠኛ ነዎት ይህንን አባል ማጥፋት ይፈልጋሉ?")) {
        members.splice(index, 1);
        renderMembers();
    }
}

function addMember() {
    const nameInput = document.getElementById("memberNameInput");
    const genderInput = document.getElementById("memberGenderInput");
    if (!nameInput) return;
    const name = nameInput.value.trim();
    const gender = genderInput ? genderInput.value : "ወንድ";

    if (!name) {
        alert("እባክዎን የስም ቦታውን ይሙሉ!");
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

document.addEventListener("DOMContentLoaded", () => {
    renderMembers();
});
