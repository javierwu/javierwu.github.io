// ========================================
// Supabase 配置
// 在 https://supabase.com 创建项目后，替换下方两个值
// ========================================
const SUPABASE_URL = 'https://wdkjwfvgfuhyczdspbii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7WskZIDKCtjhGYXcreZLyQ_8jeWpSu4';

let supabaseClient = null;
let verifiedStudentId = null;

// ========================================
// 初始化
// ========================================
function initSupabase() {
    if (typeof supabase === 'undefined') {
        document.getElementById('verifyError').textContent = '系统加载失败，请刷新页面重试';
        document.getElementById('verifyError').classList.add('visible');
        document.getElementById('verifyBtn').disabled = true;
        return;
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ========================================
// 阶段1：学号验证
// ========================================
async function verifyStudentId() {
    const input = document.getElementById('studentIdInput');
    const errorEl = document.getElementById('verifyError');
    const btn = document.getElementById('verifyBtn');
    const studentId = parseInt(input.value.trim());

    if (isNaN(studentId) || studentId < 100 || studentId > 299) {
        showError(errorEl, '请输入有效的学号（101-128 或 201-227）');
        return;
    }

    btn.disabled = true;
    btn.textContent = '验证中...';
    hideError(errorEl);

    try {
        const { data: student, error } = await supabaseClient
            .from('student_ids')
            .select('student_id, dept')
            .eq('student_id', studentId)
            .single();

        if (error || !student) {
            showError(errorEl, '学号不存在，请确认后重试');
            btn.disabled = false;
            btn.textContent = '验证学号';
            return;
        }

        verifiedStudentId = studentId;

        document.getElementById('verifyCard').classList.add('card-hidden');
        const formCard = document.getElementById('formCard');
        formCard.classList.remove('card-hidden');
        formCard.classList.add('card-fade-in');

        const deptLabel = student.dept === 1 ? '（1系）' : '（2系）';
        document.getElementById('verifiedIdDisplay').textContent = studentId + ' ' + deptLabel;

    } catch (err) {
        showError(errorEl, '验证失败，请检查网络连接后重试');
        btn.disabled = false;
        btn.textContent = '验证学号';
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
    const count = parseInt(document.getElementById('childrenCount').value) || 0;
    const container = document.getElementById('childrenAgesContainer');
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

    if (bringingSpouse && !spouseName) {
        showError(errorEl, '请填写配偶姓名');
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
    initSupabase();

    // 验证按钮
    document.getElementById('verifyBtn').addEventListener('click', verifyStudentId);
    document.getElementById('studentIdInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') verifyStudentId();
    });

    // 配偶切换
    document.querySelectorAll('input[name="bringingSpouse"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            toggleSpouseField(this.value === 'yes');
        });
    });

    // 子女数量变化
    document.getElementById('childrenCount').addEventListener('input', updateChildrenAgeInputs);

    // 提交按钮
    document.getElementById('submitBtn').addEventListener('click', submitFamilyInfo);
});
