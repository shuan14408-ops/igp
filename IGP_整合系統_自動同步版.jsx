import React, { useState, useEffect } from 'react';

// IGP 整合系統 - 自動同步版
export default function IGPSystem() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [password, setPassword] = useState('0424');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  useEffect(() => {
    loadPassword();
  }, []);

  const loadPassword = async () => {
    try {
      const result = await window.storage.get('igp_teacher_password');
      if (result && result.value) {
        setPassword(result.value);
      }
    } catch (e) {
      // 使用預設密碼
    }
  };

  const savePassword = async (newPwd) => {
    setPassword(newPwd);
    try {
      await window.storage.set('igp_teacher_password', newPwd);
    } catch (e) {
      console.error('儲存密碼失敗');
    }
  };

  const handleLogin = () => {
    if (passwordInput === password) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('密碼錯誤，請重新輸入');
    }
  };

  const handleChangePassword = async () => {
    setChangePasswordError('');
    setChangePasswordSuccess(false);
    
    if (oldPassword !== password) {
      setChangePasswordError('舊密碼不正確');
      return;
    }
    if (newPassword.length < 4) {
      setChangePasswordError('新密碼至少需要4個字元');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('新密碼與確認密碼不符');
      return;
    }
    
    await savePassword(newPassword);
    setChangePasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setShowPasswordChange(false);
      setChangePasswordSuccess(false);
    }, 2000);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const commonStyles = {
    container: {
      fontFamily: "'Noto Sans TC', 'Nunito', sans-serif",
      minHeight: '100vh',
      padding: '20px',
      color: '#4A4A6A'
    },
    card: {
      background: 'white',
      borderRadius: '30px',
      padding: '40px',
      boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    },
    input: {
      width: '100%',
      padding: '15px 20px',
      border: '2px solid #E0E0E0',
      borderRadius: '15px',
      fontSize: '1.1rem',
      boxSizing: 'border-box',
      outline: 'none',
      marginBottom: '15px'
    },
    btn: {
      padding: '15px 40px',
      border: 'none',
      borderRadius: '25px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  };

  // 角色選擇頁面
  const RoleSelectionPage = () => (
    <div style={{
      ...commonStyles.container,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={commonStyles.card}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <div style={{fontSize: '4rem', marginBottom: '20px'}}>📚</div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            IGP 個別輔導計畫系統
          </h1>
          <p style={{color: '#6B6B8D', fontSize: '1rem'}}>
            資賦優異學生個別輔導計畫填寫平台
          </p>
        </div>

        <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#4A4A6A', fontSize: '1.3rem'}}>
          請選擇您的身份
        </h2>

        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <button
            style={{
              ...commonStyles.btn,
              background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6B95 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(255, 107, 149, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              padding: '25px'
            }}
            onClick={() => setUserRole('parent')}
          >
            <span style={{fontSize: '2rem'}}>👨‍👩‍👧</span>
            <div style={{textAlign: 'left'}}>
              <div style={{fontSize: '1.3rem'}}>我是家長</div>
              <div style={{fontSize: '0.85rem', opacity: 0.9, fontWeight: '500'}}>填寫學生基本資料並繳交</div>
            </div>
          </button>

          <button
            style={{
              ...commonStyles.btn,
              background: 'linear-gradient(135deg, #7ECEC6 0%, #5EBEB6 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(126, 206, 198, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              padding: '25px'
            }}
            onClick={() => setUserRole('teacher')}
          >
            <span style={{fontSize: '2rem'}}>👩‍🏫</span>
            <div style={{textAlign: 'left'}}>
              <div style={{fontSize: '1.3rem'}}>我是教師</div>
              <div style={{fontSize: '0.85rem', opacity: 0.9, fontWeight: '500'}}>查看繳交資料並完成 IGP</div>
            </div>
          </button>
        </div>

        <p style={{textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '0.85rem'}}>
          © 2024 IGP System v2.0
        </p>
      </div>
    </div>
  );

  // 教師登入頁面
  const TeacherLoginPage = () => (
    <div style={{
      ...commonStyles.container,
      background: 'linear-gradient(135deg, #A8E6E0 0%, #FFF9F0 50%, #FFF8DC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={commonStyles.card}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{fontSize: '4rem', marginBottom: '15px'}}>🔐</div>
          <h1 style={{fontSize: '1.8rem', fontWeight: '800', color: '#7ECEC6', marginBottom: '10px'}}>
            教師登入
          </h1>
          <p style={{color: '#6B6B8D'}}>請輸入密碼以進入系統</p>
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4A4A6A'}}>密碼</label>
          <input
            type="password"
            style={{...commonStyles.input, borderColor: passwordError ? '#FF6B6B' : '#A8E6E0'}}
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
            placeholder="請輸入密碼"
            autoFocus
          />
          {passwordError && <p style={{color: '#FF6B6B', fontSize: '0.9rem', marginTop: '-10px'}}>{passwordError}</p>}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <button
            style={{...commonStyles.btn, width: '100%', background: 'linear-gradient(135deg, #7ECEC6 0%, #5EBEB6 100%)', color: 'white', boxShadow: '0 6px 20px rgba(126, 206, 198, 0.4)'}}
            onClick={handleLogin}
          >登入</button>
          
          <button
            style={{...commonStyles.btn, width: '100%', background: 'white', color: '#7ECEC6', border: '2px solid #7ECEC6'}}
            onClick={() => setUserRole(null)}
          >← 返回選擇身份</button>
        </div>

        <div style={{textAlign: 'center', marginTop: '25px'}}>
          <button
            style={{background: 'none', border: 'none', color: '#9B8AC4', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}
            onClick={() => setShowPasswordChange(true)}
          >🔧 修改密碼</button>
        </div>
      </div>

      {showPasswordChange && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{...commonStyles.card, maxWidth: '400px'}}>
            <h2 style={{textAlign: 'center', marginBottom: '25px', color: '#9B8AC4'}}>🔧 修改密碼</h2>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem'}}>舊密碼</label>
              <input type="password" style={{...commonStyles.input, padding: '12px 15px', fontSize: '1rem'}} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="請輸入舊密碼" />
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem'}}>新密碼</label>
              <input type="password" style={{...commonStyles.input, padding: '12px 15px', fontSize: '1rem'}} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少4字元" />
            </div>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem'}}>確認新密碼</label>
              <input type="password" style={{...commonStyles.input, padding: '12px 15px', fontSize: '1rem'}} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="再次輸入新密碼" />
            </div>
            {changePasswordError && <p style={{color: '#FF6B6B', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px'}}>❌ {changePasswordError}</p>}
            {changePasswordSuccess && <p style={{color: '#4CAF50', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px'}}>✅ 密碼修改成功！</p>}
            <div style={{display: 'flex', gap: '10px'}}>
              <button style={{...commonStyles.btn, flex: 1, background: '#E0E0E0', color: '#666', padding: '12px'}} onClick={() => { setShowPasswordChange(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setChangePasswordError(''); }}>取消</button>
              <button style={{...commonStyles.btn, flex: 1, background: 'linear-gradient(135deg, #9B8AC4 0%, #7B6BA4 100%)', color: 'white', padding: '12px'}} onClick={handleChangePassword}>確認修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (userRole === null) return <RoleSelectionPage />;
  if (userRole === 'teacher' && !isAuthenticated) return <TeacherLoginPage />;
  if (userRole === 'parent') return <ParentVersion onLogout={handleLogout} />;
  if (userRole === 'teacher' && isAuthenticated) return <TeacherVersion onLogout={handleLogout} password={password} savePassword={savePassword} />;
  return null;
}

// ==================== 家長版組件 ====================
function ParentVersion({ onLogout }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: '', birthDate: '', gender: '男', studentEmail: '', address: '', phone: '',
    guardian: '', guardianPhone: '', guardianRelation: '父',
    schoolYear: '114', semester: '上學期', school: '', grade: '3', classNumber: '', homeTeacher: '',
    actualCaregiver: '父', economicStatus: '小康', parentingStyle: '民主式', familyInteraction: '良好', parentExpectation: '',
    familyMembers: [{ relation: '', name: '', major: '', specialty: '', phone: '', workplace: '' }],
    scienceInterests: [], humanitiesInterests: [], otherInterests: [],
    awards: [{ date: '', competition: '', organizer: '', prize: '', type: '個人' }],
    subjectPerformance: { chinese: '優良', math: '優良', music: '普通', art: '優良', pe: '優良' },
    weekdayLearning: '', weekendLearning: '',
    cognitiveTraits: {}, emotionalTraits: {}, academicAbilities: {},
    submittedAt: null, status: 'pending'
  });

  const steps = [
    { id: 0, label: '基本資料', icon: '👤' },
    { id: 1, label: '家庭背景', icon: '👨‍👩‍👧' },
    { id: 2, label: '評量紀錄', icon: '📊' },
    { id: 3, label: '特質評估', icon: '⭐' },
    { id: 4, label: '確認繳交', icon: '✅' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (field, index, subfield, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [subfield]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // 繳交資料到共享儲存
  const submitData = async () => {
    if (!formData.studentName || !formData.school || !formData.guardian) {
      showToast('請填寫必要欄位（學生姓名、學校、法定代理人）', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const key = `igp_submission:${formData.school}_${formData.grade}_${formData.classNumber}_${formData.studentName}`;
      await window.storage.set(key, JSON.stringify(submissionData), true);
      
      setIsSubmitted(true);
      showToast('✅ 資料已成功繳交給老師！');
    } catch (error) {
      console.error('繳交失敗:', error);
      showToast('❌ 繳交失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      fontFamily: "'Noto Sans TC', 'Nunito', sans-serif",
      background: 'linear-gradient(135deg, #FFE4E1 0%, #FFF9F0 50%, #E8F5E9 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#4A4A6A'
    },
    header: {
      background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6B95 50%, #FF8E53 100%)',
      borderRadius: '25px',
      padding: '25px 30px',
      marginBottom: '25px',
      boxShadow: '0 10px 40px rgba(255, 107, 149, 0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    },
    headerTitle: { fontSize: '1.6rem', fontWeight: '800', color: 'white', margin: 0 },
    headerBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '15px', color: 'white', fontWeight: '600', fontSize: '0.9rem' },
    logoutBtn: { padding: '10px 20px', border: '2px solid white', borderRadius: '15px', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' },
    progressContainer: { background: 'white', borderRadius: '18px', padding: '15px 20px', marginBottom: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' },
    progressSteps: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1, minWidth: '60px' },
    stepCircle: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', fontSize: '14px' },
    stepLabel: { marginTop: '6px', fontSize: '0.7rem', fontWeight: '500', textAlign: 'center' },
    formSection: { background: 'white', borderRadius: '25px', padding: '25px', marginBottom: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' },
    sectionBar: { position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #FF9A8B 0%, #FF6B95 50%, #FF8E53 100%)' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#FF6B95', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
    formGroup: { marginBottom: '10px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4A4A6A', fontSize: '0.85rem' },
    input: { width: '100%', padding: '10px 12px', border: '2px solid #FFD1DC', borderRadius: '10px', fontSize: '0.9rem', background: '#FFF9F9', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', padding: '10px 12px', border: '2px solid #FFD1DC', borderRadius: '10px', fontSize: '0.9rem', background: '#FFF9F9', boxSizing: 'border-box', outline: 'none' },
    textarea: { width: '100%', padding: '10px 12px', border: '2px solid #FFD1DC', borderRadius: '10px', fontSize: '0.9rem', background: '#FFF9F9', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', outline: 'none' },
    infoCard: { background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4EC 100%)', borderRadius: '12px', padding: '12px', marginBottom: '15px', borderLeft: '4px solid #FF6B95', fontSize: '0.85rem' },
    checkboxGroup: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    checkboxItem: { padding: '6px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s ease' },
    dynamicListItem: { background: '#FFF9F9', borderRadius: '12px', padding: '12px', marginBottom: '10px', position: 'relative', border: '2px solid #FFD1DC' },
    removeBtn: { position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: '#FF6B95', color: 'white', cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1' },
    addBtn: { width: '100%', padding: '10px', border: '2px dashed #FF6B95', borderRadius: '12px', background: 'transparent', color: '#FF6B95', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
    btnGroup: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' },
    btnPrimary: { padding: '12px 30px', border: 'none', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #FF6B95 0%, #FF8E53 100%)', color: 'white', boxShadow: '0 5px 15px rgba(255, 107, 149, 0.4)' },
    btnSecondary: { padding: '12px 30px', border: '2px solid #FF6B95', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', background: 'white', color: '#FF6B95' },
    btnSubmit: { padding: '18px 50px', border: 'none', borderRadius: '25px', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)' },
    toast: { position: 'fixed', bottom: '30px', right: '30px', padding: '18px 28px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontWeight: '600', zIndex: 1000 },
    ratingGroup: { background: '#FFF9F9', borderRadius: '10px', padding: '10px', marginBottom: '6px' },
    ratingScale: { display: 'flex', gap: '5px', marginTop: '5px' },
    ratingBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '2px solid #FFD1DC', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' },
    successCard: { background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', borderRadius: '20px', padding: '40px', textAlign: 'center', marginTop: '20px' }
  };

  // 基本資料
  const BasicInfoForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>👤 基本資料</h2>
      <div style={styles.infoCard}><p>👋 請填寫孩子的基本資料</p></div>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}><label style={styles.label}>學生姓名 *</label><input style={styles.input} value={formData.studentName} onChange={e => updateFormData('studentName', e.target.value)} placeholder="請輸入學生姓名" /></div>
        <div style={styles.formGroup}><label style={styles.label}>出生日期</label><input style={styles.input} type="date" value={formData.birthDate} onChange={e => updateFormData('birthDate', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>性別</label><select style={styles.select} value={formData.gender} onChange={e => updateFormData('gender', e.target.value)}><option value="男">男</option><option value="女">女</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>Email</label><input style={styles.input} type="email" value={formData.studentEmail} onChange={e => updateFormData('studentEmail', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>電話</label><input style={styles.input} value={formData.phone} onChange={e => updateFormData('phone', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>住址</label><input style={styles.input} value={formData.address} onChange={e => updateFormData('address', e.target.value)} /></div>
      </div>
      <h3 style={{marginTop: '20px', marginBottom: '12px', color: '#FF6B95', fontSize: '1rem'}}>學校資訊</h3>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}><label style={styles.label}>學年度 *</label><input style={styles.input} value={formData.schoolYear} onChange={e => updateFormData('schoolYear', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>學期</label><select style={styles.select} value={formData.semester} onChange={e => updateFormData('semester', e.target.value)}><option value="上學期">上學期</option><option value="下學期">下學期</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>學校 *</label><input style={styles.input} value={formData.school} onChange={e => updateFormData('school', e.target.value)} placeholder="例：同德國小" /></div>
        <div style={styles.formGroup}><label style={styles.label}>年級</label><select style={styles.select} value={formData.grade} onChange={e => updateFormData('grade', e.target.value)}>{[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
        <div style={styles.formGroup}><label style={styles.label}>班級</label><input style={styles.input} value={formData.classNumber} onChange={e => updateFormData('classNumber', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>導師</label><input style={styles.input} value={formData.homeTeacher} onChange={e => updateFormData('homeTeacher', e.target.value)} /></div>
      </div>
      <h3 style={{marginTop: '20px', marginBottom: '12px', color: '#FF6B95', fontSize: '1rem'}}>法定代理人</h3>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}><label style={styles.label}>姓名 *</label><input style={styles.input} value={formData.guardian} onChange={e => updateFormData('guardian', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>關係</label><select style={styles.select} value={formData.guardianRelation} onChange={e => updateFormData('guardianRelation', e.target.value)}><option value="父">父</option><option value="母">母</option><option value="祖父">祖父</option><option value="祖母">祖母</option><option value="其他">其他</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>電話</label><input style={styles.input} value={formData.guardianPhone} onChange={e => updateFormData('guardianPhone', e.target.value)} /></div>
      </div>
    </div>
  );

  // 家庭背景
  const FamilyBackgroundForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>👨‍👩‍👧 家庭背景</h2>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}><label style={styles.label}>照顧者</label><select style={styles.select} value={formData.actualCaregiver} onChange={e => updateFormData('actualCaregiver', e.target.value)}><option value="父">父</option><option value="母">母</option><option value="父母">父母</option><option value="祖父母">祖父母</option><option value="其他">其他</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>經濟狀況</label><select style={styles.select} value={formData.economicStatus} onChange={e => updateFormData('economicStatus', e.target.value)}><option value="富裕">富裕</option><option value="小康">小康</option><option value="普通">普通</option><option value="清寒">清寒</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>管教態度</label><select style={styles.select} value={formData.parentingStyle} onChange={e => updateFormData('parentingStyle', e.target.value)}><option value="民主式">民主式</option><option value="權威式">權威式</option><option value="放任式">放任式</option><option value="溺愛式">溺愛式</option></select></div>
        <div style={styles.formGroup}><label style={styles.label}>家庭互動</label><select style={styles.select} value={formData.familyInteraction} onChange={e => updateFormData('familyInteraction', e.target.value)}><option value="良好">良好</option><option value="普通">普通</option><option value="不佳">不佳</option></select></div>
      </div>
      <div style={styles.formGroup}><label style={styles.label}>對孩子的期望</label><textarea style={styles.textarea} value={formData.parentExpectation} onChange={e => updateFormData('parentExpectation', e.target.value)} placeholder="例：快樂學習、適性發展..." /></div>
      
      <h3 style={{marginTop: '20px', marginBottom: '12px', color: '#FF6B95', fontSize: '1rem'}}>家庭成員</h3>
      {formData.familyMembers.map((member, index) => (
        <div key={index} style={styles.dynamicListItem}>
          {index > 0 && <button style={styles.removeBtn} onClick={() => removeArrayItem('familyMembers', index)}>×</button>}
          <div style={styles.formGrid}>
            <div style={styles.formGroup}><label style={styles.label}>稱謂</label><select style={styles.select} value={member.relation} onChange={e => updateNestedData('familyMembers', index, 'relation', e.target.value)}><option value="">請選擇</option><option value="父">父</option><option value="母">母</option><option value="兄">兄</option><option value="姊">姊</option><option value="弟">弟</option><option value="妹">妹</option></select></div>
            <div style={styles.formGroup}><label style={styles.label}>姓名</label><input style={styles.input} value={member.name} onChange={e => updateNestedData('familyMembers', index, 'name', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>專長</label><input style={styles.input} value={member.specialty} onChange={e => updateNestedData('familyMembers', index, 'specialty', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>電話</label><input style={styles.input} value={member.phone} onChange={e => updateNestedData('familyMembers', index, 'phone', e.target.value)} /></div>
          </div>
        </div>
      ))}
      <button style={styles.addBtn} onClick={() => addArrayItem('familyMembers', { relation: '', name: '', major: '', specialty: '', phone: '', workplace: '' })}>+ 新增成員</button>
    </div>
  );

  // 評量紀錄
  const AssessmentForm = () => {
    const scienceOptions = ['數學', '資訊科技', '物理', '化學', '生物', '地球科學'];
    const humanitiesOptions = ['國文', '英文', '歷史', '地理', '美術', '音樂'];
    const otherOptions = ['體育', '旅遊', '圍棋', '樂高', '其他'];

    const toggleInterest = (field, item) => {
      const current = formData[field];
      updateFormData(field, current.includes(item) ? current.filter(i => i !== item) : [...current, item]);
    };

    return (
      <div style={styles.formSection}>
        <div style={styles.sectionBar}></div>
        <h2 style={styles.sectionTitle}>📊 評量與表現</h2>
        
        <h3 style={{marginBottom: '10px', color: '#FF6B95', fontSize: '1rem'}}>興趣分析（可複選）</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>科學興趣</label>
          <div style={styles.checkboxGroup}>
            {scienceOptions.map(item => (
              <div key={item} style={{...styles.checkboxItem, background: formData.scienceInterests.includes(item) ? '#FF6B95' : '#FFE4EC', color: formData.scienceInterests.includes(item) ? 'white' : '#4A4A6A'}} onClick={() => toggleInterest('scienceInterests', item)}>
                {formData.scienceInterests.includes(item) ? '✓ ' : ''}{item}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>人文藝術</label>
          <div style={styles.checkboxGroup}>
            {humanitiesOptions.map(item => (
              <div key={item} style={{...styles.checkboxItem, background: formData.humanitiesInterests.includes(item) ? '#FF6B95' : '#FFE4EC', color: formData.humanitiesInterests.includes(item) ? 'white' : '#4A4A6A'}} onClick={() => toggleInterest('humanitiesInterests', item)}>
                {formData.humanitiesInterests.includes(item) ? '✓ ' : ''}{item}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>其他興趣</label>
          <div style={styles.checkboxGroup}>
            {otherOptions.map(item => (
              <div key={item} style={{...styles.checkboxItem, background: formData.otherInterests.includes(item) ? '#FF6B95' : '#FFE4EC', color: formData.otherInterests.includes(item) ? 'white' : '#4A4A6A'}} onClick={() => toggleInterest('otherInterests', item)}>
                {formData.otherInterests.includes(item) ? '✓ ' : ''}{item}
              </div>
            ))}
          </div>
        </div>

        <h3 style={{marginTop: '20px', marginBottom: '10px', color: '#FF6B95', fontSize: '1rem'}}>得獎紀錄</h3>
        {formData.awards.map((award, index) => (
          <div key={index} style={styles.dynamicListItem}>
            {index > 0 && <button style={styles.removeBtn} onClick={() => removeArrayItem('awards', index)}>×</button>}
            <div style={styles.formGrid}>
              <div style={styles.formGroup}><label style={styles.label}>日期</label><input style={styles.input} type="date" value={award.date} onChange={e => updateNestedData('awards', index, 'date', e.target.value)} /></div>
              <div style={styles.formGroup}><label style={styles.label}>競賽名稱</label><input style={styles.input} value={award.competition} onChange={e => updateNestedData('awards', index, 'competition', e.target.value)} /></div>
              <div style={styles.formGroup}><label style={styles.label}>主辦單位</label><input style={styles.input} value={award.organizer} onChange={e => updateNestedData('awards', index, 'organizer', e.target.value)} /></div>
              <div style={styles.formGroup}><label style={styles.label}>獎項</label><input style={styles.input} value={award.prize} onChange={e => updateNestedData('awards', index, 'prize', e.target.value)} /></div>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => addArrayItem('awards', { date: '', competition: '', organizer: '', prize: '', type: '個人' })}>+ 新增紀錄</button>
      </div>
    );
  };

  // 特質評估
  const TraitAssessmentForm = () => {
    const cognitiveItems = [{ id: 1, label: '觀察' }, { id: 2, label: '記憶' }, { id: 3, label: '理解' }, { id: 4, label: '推理' }, { id: 5, label: '分析' }, { id: 6, label: '創造' }, { id: 7, label: '問題解決' }];
    const emotionalItems = [{ id: 13, label: '專注' }, { id: 14, label: '動機' }, { id: 15, label: '情緒' }, { id: 16, label: '挫折容忍' }, { id: 17, label: '領導' }, { id: 18, label: '合作' }, { id: 19, label: '自信' }];

    const setRating = (category, itemId, rating) => {
      updateFormData(category, { ...formData[category], [itemId]: rating });
    };

    const RatingGroup = ({ items, category, title }) => (
      <div style={{marginBottom: '15px'}}>
        <h4 style={{marginBottom: '8px', color: '#FF6B95', fontSize: '0.95rem'}}>{title}</h4>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px'}}>
          {items.map(item => (
            <div key={item.id} style={styles.ratingGroup}>
              <span style={{fontWeight: '600', fontSize: '0.8rem'}}>{item.label}</span>
              <div style={styles.ratingScale}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button key={rating} style={{...styles.ratingBtn, background: formData[category][item.id] === rating ? '#FF6B95' : 'white', color: formData[category][item.id] === rating ? 'white' : '#4A4A6A'}} onClick={() => setRating(category, item.id, rating)}>{rating}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div style={styles.formSection}>
        <div style={styles.sectionBar}></div>
        <h2 style={styles.sectionTitle}>⭐ 特質評估</h2>
        <div style={styles.infoCard}><p>請為各項特質評分（1-5分，5分最高）</p></div>
        <RatingGroup items={cognitiveItems} category="cognitiveTraits" title="認知特質" />
        <RatingGroup items={emotionalItems} category="emotionalTraits" title="情意特質" />
      </div>
    );
  };

  // 確認繳交
  const SubmitForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>✅ 確認繳交</h2>

      {isSubmitted ? (
        <div style={styles.successCard}>
          <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎉</div>
          <h3 style={{color: '#4CAF50', marginBottom: '15px', fontSize: '1.5rem'}}>資料已成功繳交！</h3>
          <p style={{color: '#666', marginBottom: '10px'}}>老師將會在系統中收到您填寫的資料</p>
          <p style={{color: '#999', fontSize: '0.9rem'}}>繳交時間：{new Date().toLocaleString('zh-TW')}</p>
          <button style={{...styles.btnSecondary, marginTop: '25px'}} onClick={onLogout}>← 返回首頁</button>
        </div>
      ) : (
        <>
          <div style={styles.infoCard}><p>🎉 請確認以下資料無誤後點擊繳交按鈕</p></div>

          <div style={{background: '#FFE4EC', borderRadius: '15px', padding: '20px', marginTop: '15px'}}>
            <h3 style={{color: '#FF6B95', marginBottom: '12px'}}>📋 資料摘要</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>學生：</strong>{formData.studentName || '未填'}</div>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>學校：</strong>{formData.school} {formData.grade}年{formData.classNumber}班</div>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>學年：</strong>{formData.schoolYear} {formData.semester}</div>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>代理人：</strong>{formData.guardian || '未填'}</div>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>興趣：</strong>{[...formData.scienceInterests, ...formData.humanitiesInterests].slice(0, 3).join('、') || '未填'}</div>
              <div style={{background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem'}}><strong>得獎：</strong>{formData.awards.filter(a => a.competition).length} 筆</div>
            </div>
          </div>

          <div style={{textAlign: 'center', marginTop: '30px'}}>
            <button style={{...styles.btnSubmit, opacity: isSubmitting ? 0.7 : 1}} onClick={submitData} disabled={isSubmitting}>
              {isSubmitting ? '⏳ 繳交中...' : '📤 確認繳交給老師'}
            </button>
            <p style={{marginTop: '12px', color: '#FF6B95', fontSize: '0.85rem'}}>
              繳交後資料將自動送達教師系統 ✨
            </p>
          </div>
        </>
      )}
    </div>
  );

  const renderStep = () => {
    switch(currentStep) {
      case 0: return <BasicInfoForm />;
      case 1: return <FamilyBackgroundForm />;
      case 2: return <AssessmentForm />;
      case 3: return <TraitAssessmentForm />;
      case 4: return <SubmitForm />;
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>IGP 資料填寫系統</h1>
          <div style={styles.headerBadge}>👨‍👩‍👧 家長版</div>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>← 返回首頁</button>
      </header>

      <div style={styles.progressContainer}>
        <div style={styles.progressSteps}>
          {steps.map((step, idx) => (
            <div key={step.id} style={styles.step} onClick={() => !isSubmitted && setCurrentStep(idx)}>
              <div style={{...styles.stepCircle, background: currentStep === idx ? '#FF6B95' : currentStep > idx ? '#4CAF50' : '#FFD1DC'}}>
                {currentStep > idx ? '✓' : step.icon}
              </div>
              <span style={{...styles.stepLabel, color: currentStep === idx ? '#FF6B95' : '#6B6B8D', fontWeight: currentStep === idx ? '700' : '500'}}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      {!isSubmitted && (
        <div style={styles.btnGroup}>
          {currentStep > 0 && <button style={styles.btnSecondary} onClick={() => setCurrentStep(prev => prev - 1)}>← 上一步</button>}
          {currentStep < steps.length - 1 && <button style={styles.btnPrimary} onClick={() => setCurrentStep(prev => prev + 1)}>下一步 →</button>}
        </div>
      )}

      {toast.show && <div style={{...styles.toast, background: toast.type === 'error' ? '#FF6B6B' : '#4CAF50', color: 'white'}}>{toast.message}</div>}
    </div>
  );
}

// ==================== 教師版組件 ====================
function TeacherVersion({ onLogout, password, savePassword }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [submissions, setSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: '', birthDate: '', gender: '男', identificationNumber: '', studentEmail: '', address: '', phone: '',
    guardian: '', guardianPhone: '', guardianRelation: '父',
    schoolYear: '114', semester: '上學期', school: '', grade: '3', classNumber: '', homeTeacher: '', caseTeacher: '',
    actualCaregiver: '父', economicStatus: '小康', parentingStyle: '民主式', familyInteraction: '良好', parentExpectation: '',
    familyMembers: [], scienceInterests: [], humanitiesInterests: [], otherInterests: [],
    awards: [], cognitiveTraits: {}, emotionalTraits: {}, academicAbilities: {},
    strengths: [], weaknesses: [], analysisDescription: '', analysisDate: '',
    courses: [{ domain: '創造能力', courseName: '', teacher: '', goals: '', cognitiveAdjustments: [], emotionalFocus: [] }],
    timetable: {},
    meetings: [{ date: '', time: '', location: '', attendees: '', content: '', recorder: '' }]
  });

  const steps = [
    { id: 0, label: '學生列表', icon: '📋' },
    { id: 1, label: '基本資料', icon: '👤' },
    { id: 2, label: '家庭背景', icon: '👨‍👩‍👧' },
    { id: 3, label: '評量紀錄', icon: '📊' },
    { id: 4, label: '優弱勢', icon: '⚖️' },
    { id: 5, label: '課程計畫', icon: '📚' },
    { id: 6, label: '課表', icon: '📅' },
    { id: 7, label: '會議', icon: '📝' },
    { id: 8, label: '匯出', icon: '📄' }
  ];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await window.storage.list('igp_submission:', true);
      if (result && result.keys) {
        const subs = [];
        for (const key of result.keys) {
          try {
            const data = await window.storage.get(key, true);
            if (data && data.value) {
              subs.push({ key, ...JSON.parse(data.value) });
            }
          } catch (e) {
            console.error('讀取資料失敗:', key);
          }
        }
        setSubmissions(subs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
      }
    } catch (error) {
      console.error('載入繳交資料失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStudent = (submission) => {
    setFormData({ ...formData, ...submission });
    setSelectedStudent(submission);
    setCurrentStep(1);
    showToast(`已載入 ${submission.studentName} 的資料`);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (field, index, subfield, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [subfield]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const exportWord = () => {
    const igpData = { ...formData, exportDate: new Date().toLocaleDateString('zh-TW') };
    const dataStr = JSON.stringify(igpData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.studentName}_IGP_${formData.schoolYear}學年度.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ IGP 文件已匯出！');
  };

  const handleChangePassword = async () => {
    setPwdError('');
    setPwdSuccess(false);
    if (oldPwd !== password) { setPwdError('舊密碼不正確'); return; }
    if (newPwd.length < 4) { setPwdError('新密碼至少4字元'); return; }
    if (newPwd !== confirmPwd) { setPwdError('密碼不符'); return; }
    await savePassword(newPwd);
    setPwdSuccess(true);
    setTimeout(() => { setShowPasswordModal(false); setPwdSuccess(false); }, 2000);
  };

  const styles = {
    container: { fontFamily: "'Noto Sans TC', 'Nunito', sans-serif", background: 'linear-gradient(135deg, #A8E6E0 0%, #FFF9F0 50%, #FFF8DC 100%)', minHeight: '100vh', padding: '20px', color: '#4A4A6A' },
    header: { background: '#9B8AC4', borderRadius: '20px', padding: '20px 25px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(155, 138, 196, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    headerTitle: { fontSize: '1.4rem', fontWeight: '800', color: 'white', margin: 0 },
    headerBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '12px', color: 'white', fontWeight: '600', fontSize: '0.8rem' },
    headerBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    headerBtn: { padding: '8px 15px', border: '2px solid white', borderRadius: '12px', background: 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' },
    progressContainer: { background: 'white', borderRadius: '15px', padding: '10px 15px', marginBottom: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', overflowX: 'auto' },
    progressSteps: { display: 'flex', justifyContent: 'space-between', minWidth: '700px', gap: '3px' },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 },
    stepCircle: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '12px' },
    stepLabel: { marginTop: '4px', fontSize: '0.6rem', fontWeight: '500', textAlign: 'center' },
    formSection: { background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' },
    sectionBar: { position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #7ECEC6 0%, #9B8AC4 50%, #F5C4C4 100%)' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#9B8AC4', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' },
    formGroup: { marginBottom: '8px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '600', color: '#4A4A6A', fontSize: '0.8rem' },
    input: { width: '100%', padding: '8px 10px', border: '2px solid #A8E6E0', borderRadius: '8px', fontSize: '0.85rem', background: '#FFF9F0', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', padding: '8px 10px', border: '2px solid #A8E6E0', borderRadius: '8px', fontSize: '0.85rem', background: '#FFF9F0', boxSizing: 'border-box', outline: 'none' },
    textarea: { width: '100%', padding: '8px 10px', border: '2px solid #A8E6E0', borderRadius: '8px', fontSize: '0.85rem', background: '#FFF9F0', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical', outline: 'none' },
    infoCard: { background: 'linear-gradient(135deg, #FFF8DC 0%, #F5C4C4 100%)', borderRadius: '10px', padding: '10px', marginBottom: '12px', borderLeft: '4px solid #9B8AC4', fontSize: '0.8rem' },
    checkboxGroup: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    checkboxItem: { padding: '5px 10px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem' },
    dynamicListItem: { background: '#FFF9F0', borderRadius: '10px', padding: '10px', marginBottom: '8px', position: 'relative', border: '2px solid #A8E6E0' },
    removeBtn: { position: 'absolute', top: '5px', right: '5px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#F5C4C4', color: 'white', cursor: 'pointer', fontSize: '0.85rem', lineHeight: '1' },
    addBtn: { width: '100%', padding: '8px', border: '2px dashed #7ECEC6', borderRadius: '10px', background: 'transparent', color: '#7ECEC6', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
    btnGroup: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '15px', flexWrap: 'wrap' },
    btnPrimary: { padding: '10px 25px', border: 'none', borderRadius: '18px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #9B8AC4 0%, #7B6BA4 100%)', color: 'white' },
    btnSecondary: { padding: '10px 25px', border: '2px solid #9B8AC4', borderRadius: '18px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', background: 'white', color: '#9B8AC4' },
    btnSuccess: { padding: '12px 35px', border: 'none', borderRadius: '18px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #7ECEC6 0%, #5EBEB6 100%)', color: 'white' },
    toast: { position: 'fixed', bottom: '25px', right: '25px', background: '#7ECEC6', color: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontWeight: '600', zIndex: 1000 },
    studentCard: { background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '10px', border: '2px solid #A8E6E0', cursor: 'pointer', transition: 'all 0.3s ease' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'white', borderRadius: '20px', padding: '25px', maxWidth: '350px', width: '90%' }
  };

  // 學生列表
  const StudentListForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>📋 已繳交學生列表</h2>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
        <span style={{color: '#666', fontSize: '0.9rem'}}>共 {submissions.length} 筆資料</span>
        <button style={{padding: '8px 15px', border: 'none', borderRadius: '10px', background: '#7ECEC6', color: 'white', cursor: 'pointer', fontSize: '0.85rem'}} onClick={loadSubmissions}>
          🔄 重新整理
        </button>
      </div>

      {isLoading ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
          <div style={{fontSize: '2rem', marginBottom: '10px'}}>⏳</div>
          載入中...
        </div>
      ) : submissions.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
          <div style={{fontSize: '3rem', marginBottom: '15px'}}>📭</div>
          <p>目前沒有家長繳交的資料</p>
          <p style={{fontSize: '0.85rem', marginTop: '10px'}}>家長填寫完成後會自動顯示在這裡</p>
        </div>
      ) : (
        <div>
          {submissions.map((sub, index) => (
            <div 
              key={index} 
              style={{...styles.studentCard, borderColor: selectedStudent?.key === sub.key ? '#9B8AC4' : '#A8E6E0'}}
              onClick={() => selectStudent(sub)}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: '700', fontSize: '1.1rem', color: '#4A4A6A'}}>{sub.studentName}</div>
                  <div style={{color: '#666', fontSize: '0.85rem', marginTop: '4px'}}>
                    {sub.school} {sub.grade}年{sub.classNumber}班
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{
                    padding: '4px 10px', 
                    borderRadius: '10px', 
                    fontSize: '0.75rem',
                    background: sub.status === 'completed' ? '#E8F5E9' : '#FFF3E0',
                    color: sub.status === 'completed' ? '#4CAF50' : '#FF9800'
                  }}>
                    {sub.status === 'completed' ? '已完成' : '待處理'}
                  </div>
                  <div style={{color: '#999', fontSize: '0.75rem', marginTop: '5px'}}>
                    {new Date(sub.submittedAt).toLocaleDateString('zh-TW')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 基本資料
  const BasicInfoForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>👤 基本資料 <span style={{fontSize: '0.75rem', color: '#4CAF50'}}>（已匯入）</span></h2>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}><label style={styles.label}>學生姓名</label><input style={styles.input} value={formData.studentName} onChange={e => updateFormData('studentName', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>出生日期</label><input style={styles.input} type="date" value={formData.birthDate} onChange={e => updateFormData('birthDate', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>鑑定文號</label><input style={styles.input} value={formData.identificationNumber} onChange={e => updateFormData('identificationNumber', e.target.value)} placeholder="113年4月22日..." /></div>
        <div style={styles.formGroup}><label style={styles.label}>學年度</label><input style={styles.input} value={formData.schoolYear} onChange={e => updateFormData('schoolYear', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>學校</label><input style={styles.input} value={formData.school} onChange={e => updateFormData('school', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>班級</label><input style={styles.input} value={`${formData.grade}年${formData.classNumber}班`} readOnly /></div>
        <div style={styles.formGroup}><label style={styles.label}>導師</label><input style={styles.input} value={formData.homeTeacher} onChange={e => updateFormData('homeTeacher', e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.label}>個管教師 *</label><input style={styles.input} value={formData.caseTeacher} onChange={e => updateFormData('caseTeacher', e.target.value)} placeholder="請輸入您的姓名" /></div>
        <div style={styles.formGroup}><label style={styles.label}>法定代理人</label><input style={styles.input} value={formData.guardian} readOnly /></div>
      </div>
    </div>
  );

  // 家庭背景
  const FamilyBackgroundForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>👨‍👩‍👧 家庭背景</h2>
      <div style={styles.formGrid}>
        <div style={{background: '#FFF9F0', padding: '10px', borderRadius: '8px'}}><strong>照顧者：</strong>{formData.actualCaregiver}</div>
        <div style={{background: '#FFF9F0', padding: '10px', borderRadius: '8px'}}><strong>經濟：</strong>{formData.economicStatus}</div>
        <div style={{background: '#FFF9F0', padding: '10px', borderRadius: '8px'}}><strong>管教：</strong>{formData.parentingStyle}</div>
        <div style={{background: '#FFF9F0', padding: '10px', borderRadius: '8px'}}><strong>互動：</strong>{formData.familyInteraction}</div>
      </div>
      {formData.parentExpectation && (
        <div style={{marginTop: '12px', background: '#FFF9F0', padding: '12px', borderRadius: '10px'}}>
          <strong>期望：</strong>{formData.parentExpectation}
        </div>
      )}
    </div>
  );

  // 評量紀錄
  const AssessmentForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>📊 評量紀錄</h2>
      <div style={{marginBottom: '12px', fontSize: '0.85rem'}}>
        <p><strong>科學興趣：</strong>{formData.scienceInterests?.join('、') || '無'}</p>
        <p><strong>人文藝術：</strong>{formData.humanitiesInterests?.join('、') || '無'}</p>
      </div>
      <h3 style={{marginTop: '15px', marginBottom: '10px', color: '#7B6BA4', fontSize: '0.95rem'}}>鑑定資料（教師填寫）</h3>
      {(formData.assessments || [{ toolName: '', testDate: '', standardScore: '', percentile: '' }]).map((assessment, index) => (
        <div key={index} style={styles.dynamicListItem}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}><label style={styles.label}>評量工具</label><input style={styles.input} value={assessment.toolName || ''} onChange={e => updateNestedData('assessments', index, 'toolName', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>施測日期</label><input style={styles.input} type="date" value={assessment.testDate || ''} onChange={e => updateNestedData('assessments', index, 'testDate', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>標準分數</label><input style={styles.input} value={assessment.standardScore || ''} onChange={e => updateNestedData('assessments', index, 'standardScore', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>百分等級</label><input style={styles.input} value={assessment.percentile || ''} onChange={e => updateNestedData('assessments', index, 'percentile', e.target.value)} /></div>
          </div>
        </div>
      ))}
    </div>
  );

  // 優弱勢分析
  const StrengthWeaknessForm = () => {
    const allTraits = [
      { id: '①', label: '觀察' }, { id: '②', label: '記憶' }, { id: '③', label: '理解' }, { id: '④', label: '推理' },
      { id: '⑤', label: '分析' }, { id: '⑥', label: '創造' }, { id: '⑦', label: '問題解決' },
      { id: '⑧', label: '專注' }, { id: '⑨', label: '動機' }, { id: '⑩', label: '情緒' }, { id: '⑪', label: '領導' },
      { id: '⑫', label: '數學' }, { id: '⑬', label: '國文' }, { id: '⑭', label: '英文' }, { id: '⑮', label: '資訊' }
    ];

    const toggleTrait = (field, id) => {
      const current = formData[field] || [];
      updateFormData(field, current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
    };

    return (
      <div style={styles.formSection}>
        <div style={styles.sectionBar}></div>
        <h2 style={styles.sectionTitle}>⚖️ 優弱勢分析</h2>
        <div style={styles.infoCard}><p><span style={{color: '#7ECEC6'}}>■綠=優勢</span> | <span style={{color: '#E8A5A5'}}>■粉=弱勢</span></p></div>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '15px'}}>
          {allTraits.map(trait => (
            <div key={trait.id} style={{display: 'flex', gap: '2px'}}>
              <div style={{...styles.checkboxItem, background: (formData.strengths || []).includes(trait.id) ? '#7ECEC6' : '#F5E6B8', color: (formData.strengths || []).includes(trait.id) ? 'white' : '#4A4A6A'}} onClick={() => toggleTrait('strengths', trait.id)}>{trait.id}{trait.label}↑</div>
              <div style={{...styles.checkboxItem, background: (formData.weaknesses || []).includes(trait.id) ? '#F5C4C4' : '#F5E6B8', color: (formData.weaknesses || []).includes(trait.id) ? 'white' : '#4A4A6A'}} onClick={() => toggleTrait('weaknesses', trait.id)}>↓</div>
            </div>
          ))}
        </div>
        
        <div style={styles.formGroup}><label style={styles.label}>質性描述</label><textarea style={{...styles.textarea, minHeight: '100px'}} value={formData.analysisDescription || ''} onChange={e => updateFormData('analysisDescription', e.target.value)} placeholder="請撰寫學生優弱勢能力分析..." /></div>
      </div>
    );
  };

  // 課程計畫
  const CurriculumForm = () => {
    const domains = ['創造能力', '領導才能', '獨立研究', '情意發展', '專長領域'];
    const updateCourse = (index, field, value) => {
      const newCourses = [...(formData.courses || [])];
      newCourses[index] = { ...newCourses[index], [field]: value };
      updateFormData('courses', newCourses);
    };

    return (
      <div style={styles.formSection}>
        <div style={styles.sectionBar}></div>
        <h2 style={styles.sectionTitle}>📚 課程計畫</h2>
        {(formData.courses || []).map((course, index) => (
          <div key={index} style={styles.dynamicListItem}>
            <h4 style={{marginBottom: '10px', color: '#7B6BA4'}}>課程 {index + 1}</h4>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}><label style={styles.label}>領域</label><select style={styles.select} value={course.domain || ''} onChange={e => updateCourse(index, 'domain', e.target.value)}>{domains.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div style={styles.formGroup}><label style={styles.label}>課程名稱</label><input style={styles.input} value={course.courseName || ''} onChange={e => updateCourse(index, 'courseName', e.target.value)} /></div>
              <div style={styles.formGroup}><label style={styles.label}>授課教師</label><input style={styles.input} value={course.teacher || ''} onChange={e => updateCourse(index, 'teacher', e.target.value)} /></div>
            </div>
            <div style={styles.formGroup}><label style={styles.label}>目標</label><textarea style={styles.textarea} value={course.goals || ''} onChange={e => updateCourse(index, 'goals', e.target.value)} /></div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => updateFormData('courses', [...(formData.courses || []), { domain: '創造能力', courseName: '', teacher: '', goals: '' }])}>+ 新增課程</button>
      </div>
    );
  };

  // 課表
  const TimetableForm = () => {
    const days = ['一', '二', '三', '四', '五'];
    const periods = ['1', '2', '3', '4', '5', '6', '7'];
    const [editCell, setEditCell] = useState(null);
    const [input, setInput] = useState('');

    return (
      <div style={styles.formSection}>
        <div style={styles.sectionBar}></div>
        <h2 style={styles.sectionTitle}>📅 課表排程</h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '3px'}}>
            <thead>
              <tr>
                <th style={{background: '#9B8AC4', color: 'white', padding: '8px', borderRadius: '5px', fontSize: '0.75rem'}}>節次</th>
                {days.map(d => <th key={d} style={{background: '#9B8AC4', color: 'white', padding: '8px', borderRadius: '5px', fontSize: '0.75rem'}}>週{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map(p => (
                <tr key={p}>
                  <td style={{background: '#7ECEC6', color: 'white', padding: '6px', borderRadius: '5px', textAlign: 'center', fontSize: '0.7rem'}}>第{p}節</td>
                  {days.map(d => {
                    const key = `${d}-${p}`;
                    const val = (formData.timetable || {})[key];
                    return (
                      <td key={key} style={{background: val ? '#F5E6B8' : '#FFF9F0', padding: '5px', borderRadius: '5px', textAlign: 'center', cursor: 'pointer', fontSize: '0.7rem'}} onClick={() => { setEditCell(key); setInput(val || ''); }}>
                        {editCell === key ? (
                          <input autoFocus value={input} onChange={e => setInput(e.target.value)} onBlur={() => { updateFormData('timetable', {...(formData.timetable || {}), [key]: input}); setEditCell(null); }} onKeyPress={e => e.key === 'Enter' && e.target.blur()} style={{width: '100%', padding: '3px', border: '1px solid #9B8AC4', borderRadius: '3px', fontSize: '0.7rem'}} />
                        ) : (val || '+')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 會議紀錄
  const MeetingForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>📝 會議紀錄</h2>
      {(formData.meetings || []).map((meeting, index) => (
        <div key={index} style={styles.dynamicListItem}>
          {index > 0 && <button style={styles.removeBtn} onClick={() => removeArrayItem('meetings', index)}>×</button>}
          <div style={styles.formGrid}>
            <div style={styles.formGroup}><label style={styles.label}>日期</label><input style={styles.input} type="date" value={meeting.date || ''} onChange={e => updateNestedData('meetings', index, 'date', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>時間</label><input style={styles.input} value={meeting.time || ''} onChange={e => updateNestedData('meetings', index, 'time', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>地點</label><input style={styles.input} value={meeting.location || ''} onChange={e => updateNestedData('meetings', index, 'location', e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.label}>記錄者</label><input style={styles.input} value={meeting.recorder || ''} onChange={e => updateNestedData('meetings', index, 'recorder', e.target.value)} /></div>
          </div>
          <div style={styles.formGroup}><label style={styles.label}>與會人員</label><input style={styles.input} value={meeting.attendees || ''} onChange={e => updateNestedData('meetings', index, 'attendees', e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>會議內容</label><textarea style={styles.textarea} value={meeting.content || ''} onChange={e => updateNestedData('meetings', index, 'content', e.target.value)} /></div>
        </div>
      ))}
      <button style={styles.addBtn} onClick={() => addArrayItem('meetings', { date: '', time: '', location: '', attendees: '', content: '', recorder: '' })}>+ 新增會議</button>
    </div>
  );

  // 匯出
  const ExportForm = () => (
    <div style={styles.formSection}>
      <div style={styles.sectionBar}></div>
      <h2 style={styles.sectionTitle}>📄 匯出 IGP 文件</h2>
      <div style={{background: '#F5E6B8', borderRadius: '12px', padding: '15px'}}>
        <h3 style={{color: '#7B6BA4', marginBottom: '10px', fontSize: '1rem'}}>📋 資料摘要</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px'}}>
          <div style={{background: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem'}}><strong>學生：</strong>{formData.studentName}</div>
          <div style={{background: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem'}}><strong>班級：</strong>{formData.school} {formData.grade}年{formData.classNumber}班</div>
          <div style={{background: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem'}}><strong>個管：</strong>{formData.caseTeacher || '未填'}</div>
          <div style={{background: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem'}}><strong>課程：</strong>{(formData.courses || []).length} 門</div>
        </div>
      </div>
      <div style={{textAlign: 'center', marginTop: '25px'}}>
        <button style={styles.btnSuccess} onClick={exportWord}>📄 匯出 IGP 文件</button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch(currentStep) {
      case 0: return <StudentListForm />;
      case 1: return <BasicInfoForm />;
      case 2: return <FamilyBackgroundForm />;
      case 3: return <AssessmentForm />;
      case 4: return <StrengthWeaknessForm />;
      case 5: return <CurriculumForm />;
      case 6: return <TimetableForm />;
      case 7: return <MeetingForm />;
      case 8: return <ExportForm />;
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>IGP 資優學生輔導計畫</h1>
          <div style={styles.headerBadge}>👩‍🏫 教師版</div>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.headerBtn} onClick={() => setShowPasswordModal(true)}>🔧 密碼</button>
          <button style={styles.headerBtn} onClick={onLogout}>← 登出</button>
        </div>
      </header>

      <div style={styles.progressContainer}>
        <div style={styles.progressSteps}>
          {steps.map((step, idx) => (
            <div key={step.id} style={styles.step} onClick={() => (idx === 0 || selectedStudent) && setCurrentStep(idx)}>
              <div style={{...styles.stepCircle, background: currentStep === idx ? '#9B8AC4' : currentStep > idx ? '#7ECEC6' : '#A8E6E0', opacity: idx > 0 && !selectedStudent ? 0.5 : 1}}>
                {currentStep > idx ? '✓' : step.icon}
              </div>
              <span style={{...styles.stepLabel, color: currentStep === idx ? '#9B8AC4' : '#6B6B8D'}}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      {currentStep > 0 && selectedStudent && (
        <div style={styles.btnGroup}>
          <button style={styles.btnSecondary} onClick={() => setCurrentStep(prev => prev - 1)}>← 上一步</button>
          {currentStep < steps.length - 1 && <button style={styles.btnPrimary} onClick={() => setCurrentStep(prev => prev + 1)}>下一步 →</button>}
        </div>
      )}

      {toast.show && <div style={styles.toast}>{toast.message}</div>}

      {showPasswordModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{textAlign: 'center', marginBottom: '15px', color: '#9B8AC4', fontSize: '1.2rem'}}>🔧 修改密碼</h2>
            <input type="password" placeholder="舊密碼" value={oldPwd} onChange={e => setOldPwd(e.target.value)} style={{...styles.input, marginBottom: '10px'}} />
            <input type="password" placeholder="新密碼（至少4字元）" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{...styles.input, marginBottom: '10px'}} />
            <input type="password" placeholder="確認新密碼" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={{...styles.input, marginBottom: '10px'}} />
            {pwdError && <p style={{color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center'}}>❌ {pwdError}</p>}
            {pwdSuccess && <p style={{color: '#4CAF50', fontSize: '0.85rem', textAlign: 'center'}}>✅ 修改成功！</p>}
            <div style={{display: 'flex', gap: '8px', marginTop: '15px'}}>
              <button style={{flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: '#E0E0E0', cursor: 'pointer'}} onClick={() => setShowPasswordModal(false)}>取消</button>
              <button style={{flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: '#9B8AC4', color: 'white', cursor: 'pointer'}} onClick={handleChangePassword}>確認</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
