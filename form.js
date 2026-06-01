// ========================================
// Supabase 配置
// ========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://wdkjwfvgfuhyczdspbii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7WskZIDKCtjhGYXcreZLyQ_8jeWpSu4';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let verifiedStudentId = null;
let verifiedName = null;

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
// 阶段2：表单交互
// ========================================
function toggleSpouseField(show) {
    document.getElementById('spouseNameGroup').style.display = show ? 'block' : 'none';
    if (!show) {
        document.getElementById('spouseName').value = '';
    }
}

function updateChildrenAgeInputs() {
    var count = parseInt(document.getElementById('childrenCount').value) || 0;
    var container = document.getElementById('childrenAgesContainer');
    container.innerHTML = '';

    for (var i = 1; i <= count; i++) {
        var div = document.createElement('div');
        div.className = 'child-age-input';
        div.innerHTML =
            '<label>第' + i + '个孩子</label>' +
            '<input type="number" class="form-input child-age" min="0" max="18" placeholder="年龄（岁）" data-index="' + i + '">';
        container.appendChild(div);
    }
}

// ========================================
// 阶段2：提交
// ========================================
async function submitFamilyInfo() {
    var btn = document.getElementById('submitBtn');
    var errorEl = document.getElementById('submitError');

    var bringingSpouse = document.querySelector('input[name="bringingSpouse"]:checked').value === 'yes';
    var spouseName = bringingSpouse ? document.getElementById('spouseName').value.trim() : null;
    var childrenCount = parseInt(document.getElementById('childrenCount').value) || 0;
    var childAgeInputs = document.querySelectorAll('.child-age');
    var childrenAges = [];
    childAgeInputs.forEach(function(input) {
        var val = input.value.trim();
        if (val !== '') childrenAges.push(val);
    });
    var dietaryRestrictions = document.getElementById('dietaryRestrictions').value.trim();
    var specialNeeds = document.getElementById('specialNeeds').value.trim();
    var idCard = document.getElementById('idCard').value.trim();

    if (bringingSpouse && !spouseName) {
        showError(errorEl, '请填写配偶姓名');
        return;
    }

    if (idCard.length > 0 && idCard.length !== 18) {
        showError(errorEl, '身份证号应为18位');
        return;
    }

    btn.disabled = true;
    btn.textContent = '提交中...';
    hideError(errorEl);

    try {
        var result = await supabaseClient
            .from('family_info')
            .insert({
                student_id: verifiedStudentId,
                bringing_spouse: bringingSpouse,
                spouse_name: spouseName,
                children_count: childrenCount,
                children_ages: childrenAges.join(','),
                dietary_restrictions: dietaryRestrictions,
                special_needs: specialNeeds,
                id_card: idCard
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
            studentId: verifiedStudentId,
            bringingSpouse: bringingSpouse,
            spouseName: spouseName,
            childrenCount: childrenCount,
            childrenAges: childrenAges,
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
    document.getElementById('summaryId').textContent = info.studentId;

    var spouseText = info.bringingSpouse ? '是' : '否';
    if (info.bringingSpouse && info.spouseName) {
        spouseText += '（' + info.spouseName + '）';
    }
    document.getElementById('summarySpouse').textContent = spouseText;

    var childrenText = info.childrenCount > 0 ? info.childrenCount + '人' : '无';
    if (info.childrenAges.length > 0) {
        childrenText += '，年龄：' + info.childrenAges.join('、') + '岁';
    }
    document.getElementById('summaryChildren').textContent = childrenText;

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

    document.querySelectorAll('input[name="bringingSpouse"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            toggleSpouseField(this.value === 'yes');
        });
    });

    document.getElementById('childrenCount').addEventListener('input', updateChildrenAgeInputs);
    document.getElementById('submitBtn').addEventListener('click', submitFamilyInfo);
});
