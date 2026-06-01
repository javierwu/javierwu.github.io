import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://wdkjwfvgfuhyczdspbii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7WskZIDKCtjhGYXcreZLyQ_8jeWpSu4';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let verifiedStudentId = null;
let verifiedName = null;
let memberCount = 0;

// ========================================
// 阶段1：身份验证（姓名+学号）
// ========================================
async function verifyIdentity() {
    var nameInput = document.getElementById('nameInput');
    var idInput = document.getElementById('studentIdInput');
    var errorEl = document.getElementById('verifyError');
    var btn = document.getElementById('verifyBtn');
    var name = nameInput.value.trim();
    var studentId = parseInt(idInput.value.trim());

    if (name.length < 2) {
        showError(errorEl, '请输入姓名');
        return;
    }
    if (isNaN(studentId) || studentId < 100 || studentId > 299) {
        showError(errorEl, '请输入有效的学号（101-128 或 201-227）');
        return;
    }

    btn.disabled = true;
    btn.textContent = '验证中...';
    hideError(errorEl);

    try {
        var result = await supabaseClient
            .from('students')
            .select('student_id, dept, name')
            .eq('name', name)
            .eq('student_id', studentId)
            .single();

        if (result.error || !result.data) {
            showError(errorEl, '姓名与学号不匹配，请确认后重试');
            btn.disabled = false;
            btn.textContent = '验证身份';
            return;
        }

        var student = result.data;
        verifiedStudentId = student.student_id;
        verifiedName = student.name;

        document.getElementById('verifyCard').classList.add('card-hidden');
        var formCard = document.getElementById('formCard');
        formCard.classList.remove('card-hidden');
        formCard.classList.add('card-fade-in');

        var deptLabel = student.dept === 1 ? '1系' : '2系';
        document.getElementById('verifiedIdDisplay').textContent =
            student.name + '（' + deptLabel + '）';

    } catch (err) {
        showError(errorEl, '验证失败，请检查网络连接后重试');
        btn.disabled = false;
        btn.textContent = '验证身份';
    }
}

// ========================================
// 阶段2：随行家属管理
// ========================================
function addMember() {
    memberCount++;
    var idx = memberCount;
    var container = document.getElementById('membersContainer');
    var card = document.createElement('div');
    card.className = 'member-card';
    card.dataset.index = idx;
    card.innerHTML =
        '<div class="member-card-header">' +
            '<span class="member-card-title">随行家属 ' + idx + '</span>' +
            '<button type="button" class="btn-remove-member" data-idx="' + idx + '">×</button>' +
        '</div>' +
        '<div class="member-card-body">' +
            '<div class="form-row">' +
                '<div class="form-group form-group-half">' +
                    '<input type="text" class="form-input member-name" placeholder="姓名">' +
                '</div>' +
                '<div class="form-group form-group-half">' +
                    '<input type="text" class="form-input member-idcard" placeholder="身份证号" maxlength="18">' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<div class="radio-group radio-group-sm">' +
                    '<div class="radio-pill">' +
                        '<input type="radio" name="mtype_' + idx + '" value="spouse" checked>' +
                        '<label>配偶</label>' +
                    '</div>' +
                    '<div class="radio-pill">' +
                        '<input type="radio" name="mtype_' + idx + '" value="child">' +
                        '<label>子女</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="form-group member-age-group" style="display:none;">' +
                '<input type="number" class="form-input member-age" placeholder="年龄（岁）" min="0" max="18">' +
            '</div>' +
        '</div>';
    container.appendChild(card);

    card.querySelector('.btn-remove-member').addEventListener('click', function() {
        removeMember(idx);
    });
    card.querySelectorAll('input[name="mtype_' + idx + '"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            card.querySelector('.member-age-group').style.display =
                this.value === 'child' ? 'block' : 'none';
            if (this.value === 'spouse') {
                card.querySelector('.member-age').value = '';
            }
        });
    });

    hideError(document.getElementById('memberError'));
}

function removeMember(idx) {
    var card = document.querySelector('.member-card[data-index="' + idx + '"]');
    if (card) {
        card.remove();
    }
}

function updateRoomOptions() {
}

// ========================================
// 阶段2：验证 + 提交
// ========================================
function validateIdCard(val, prefix) {
    if (!val) return prefix + '请填写身份证号';
    if (val.length !== 18) return prefix + '身份证号应为18位';
    if (!/^\d{17}[\dXx]$/.test(val)) return prefix + '身份证号格式不正确';
    return '';
}

async function submitFamilyInfo() {
    var btn = document.getElementById('submitBtn');
    var errorEl = document.getElementById('submitError');

    // 本人身份证
    var idCard = document.getElementById('idCard').value.trim();
    var err = validateIdCard(idCard, '本人');
    if (err) { showError(errorEl, err); return; }

    // 收集家属
    var memberCards = document.querySelectorAll('.member-card');
    var members = [];
    var seenIdCards = [idCard];
    for (var i = 0; i < memberCards.length; i++) {
        var card = memberCards[i];
        var mName = card.querySelector('.member-name').value.trim();
        var mIdCard = card.querySelector('.member-idcard').value.trim();
        var mType = card.querySelector('input[name^="mtype_"]:checked').value;
        var mAge = mType === 'child' ? (parseInt(card.querySelector('.member-age').value) || null) : null;

        err = validateIdCard(mIdCard, '家属');
        if (err) { showError(errorEl, err); return; }
        if (!mName) { showError(errorEl, '请填写家属姓名'); return; }
        if (seenIdCards.indexOf(mIdCard) !== -1) {
            showError(errorEl, '身份证号不能重复');
            return;
        }
        seenIdCards.push(mIdCard);
        members.push({ name: mName, id_card: mIdCard, type: mType, age: mAge });
    }

    var roomType = document.querySelector('input[name="roomType"]:checked').value;
    if (roomType === 'shared' && members.length > 0) {
        showError(errorEl, '拼房仅限不带随行家属的同学选择，请更换房型');
        return;
    }

    var dietaryRestrictions = document.getElementById('dietaryRestrictions').value.trim();
    var specialNeeds = document.getElementById('specialNeeds').value.trim();

    btn.disabled = true;
    btn.textContent = '提交中...';
    hideError(errorEl);

    try {
        var result = await supabaseClient
            .from('family_info')
            .insert({
                student_id: verifiedStudentId,
                student_id_card: idCard,
                members: members,
                room_type: roomType,
                dietary_restrictions: dietaryRestrictions,
                special_needs: specialNeeds
            });

        if (result.error) {
            if (result.error.code === '23505') {
                showAlreadySubmitted();
            } else {
                showError(errorEl, '提交失败：' + (result.error.message || '未知错误'));
            }
            btn.disabled = false;
            btn.textContent = '提交信息';
            return;
        }

        showSuccess({
            name: verifiedName,
            roomType: roomType,
            members: members,
            dietaryRestrictions: dietaryRestrictions,
            specialNeeds: specialNeeds
        });

    } catch (err) {
        showError(errorEl, '提交失败，请检查网络连接后重试');
        btn.disabled = false;
        btn.textContent = '提交信息';
    }
}

function showAlreadySubmitted() {
    document.getElementById('formCard').classList.add('card-hidden');
    var card = document.getElementById('alreadyCard');
    card.classList.remove('card-hidden');
    card.classList.add('card-fade-in');
}

function showSuccess(info) {
    document.getElementById('formCard').classList.add('card-hidden');
    var card = document.getElementById('successCard');
    card.classList.remove('card-hidden');
    card.classList.add('card-fade-in');

    document.getElementById('summaryName').textContent = info.name;

    var roomMap = { twin: '双床房', king: '大床房', family: '家庭房', shared: '拼房' };
    document.getElementById('summaryRoom').textContent = roomMap[info.roomType] || info.roomType;

    var membersHtml = '';
    if (info.members.length > 0) {
        membersHtml = '<div class="summary-section-title">随行家属</div>';
        info.members.forEach(function(m) {
            var label = m.type === 'spouse' ? '配偶' : '子女';
            if (m.type === 'child' && m.age) label += '（' + m.age + '岁）';
            membersHtml += '<div class="summary-member-item">' + m.name + ' · ' + label + '</div>';
        });
    }
    document.getElementById('summaryMembers').innerHTML = membersHtml;

    document.getElementById('summaryDietary').textContent = info.dietaryRestrictions || '无';
    document.getElementById('summarySpecial').textContent = info.specialNeeds || '无';
}

// ========================================
// 工具函数
// ========================================
function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
}

function hideError(el) {
    el.classList.remove('visible');
}

// ========================================
// 事件绑定
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('verifyBtn').addEventListener('click', verifyIdentity);
    document.getElementById('nameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('studentIdInput').focus();
    });
    document.getElementById('studentIdInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') verifyIdentity();
    });

    document.getElementById('addMemberBtn').addEventListener('click', addMember);
    document.getElementById('submitBtn').addEventListener('click', submitFamilyInfo);
});
