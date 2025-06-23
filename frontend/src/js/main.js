import Alpine from 'alpinejs'
window.Alpine = Alpine

Alpine.data('formDangKy', () => ({
  // ---------- STATE ----------
  acceptedRules: false,
  agreeTruth:    false,

  form: {
    hoTen: '',
    gioiTinh: '',
    namSinh: '',
    cccd: '',
    soDienThoai: '',
    sdtKhanCap: '',
    diaChi: '',
    ngayDen: '',
    thoiGianTu: '',
    physicalIssue: '',
    physicalNote: '',
    mentalIssue: '',
    mentalNote: '',
    ghiChu: ''
  },

  valid: {
    hoTen: null, gioiTinh: null, namSinh: null, cccd: null,
    soDienThoai: null, sdtKhanCap: null, diaChi: null,
    ngayDen: null, thoiGianTu: null
  },

  touched: {
    hoTen: false, gioiTinh: false, namSinh: false, cccd: false,
    soDienThoai: false, sdtKhanCap: false, diaChi: false,
    ngayDen: false, thoiGianTu: false
  },

  minNgay: '',          // yyyy-mm-dd
  years: [],            // dropdown năm sinh
  provinces: [],        // 63 tỉnh thành

  // ---------- INIT ----------
  init () {
    const today = new Date()
    this.minNgay = today.toISOString().split('T')[0]

    // generate years (1920 → current)
    const current = today.getFullYear()
    this.years = Array.from({ length: 106 }, (_, i) => current - i)

    // 63 provinces
    this.provinces = [
      'An Giang','Bà Rịa – Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu',
      'Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước',
      'Bình Thuận','Cà Mau','Cần Thơ','Cao Bằng','Đà Nẵng',
      'Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp',
      'Gia Lai','Hà Giang','Hà Nam','Hà Nội','Hà Tĩnh',
      'Hải Dương','Hải Phòng','Hậu Giang','Hòa Bình','Hưng Yên',
      'Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng',
      'Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An',
      'Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình',
      'Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng',
      'Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa',
      'Thừa Thiên Huế','Tiền Giang','TP. Hồ Chí Minh','Trà Vinh',
      'Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'
    ]
  },

  // ---------- VALIDATORS ----------
  validateHoTen ()     { this._setValid('hoTen',  v => v.trim() !== '') },
  validateGioiTinh ()  { this._setValid('gioiTinh', v => v !== '') },
  validateNamSinh ()   { this._setValid('namSinh', v => !!v) },
  validateCCCD ()      { this._setValid('cccd',  v => /^\d{12}$/.test(v)) },
  validateSDT ()       { this._setValid('soDienThoai',  v => /^\d{10,11}$/.test(v)) },
  validateSDTKhanCap(){ this._setValid('sdtKhanCap',  v => /^\d{10,11}$/.test(v)) },
  validateDiaChi ()    { this._setValid('diaChi', v => v !== '') },
  validateNgayDen ()   {
    this._setValid('ngayDen', v => v && v >= this.minNgay)
  },
  validateThoiGian ()  { this._setValid('thoiGianTu', v => v !== '') },

  // helper
  _setValid (field, fn) {
    this.touched[field] = true
    this.valid[field]   = fn(this.form[field])
  },

  // ---------- SUBMIT ----------
  get formReady () {
    return this.acceptedRules && this.agreeTruth &&
           Object.values(this.valid).every(v => v === true)
  },

  submitForm () {
    // trigger validation for untouched required fields
    Object.keys(this.valid).forEach(key => {
      if (this.valid[key] === null) this[`validate${this._title(key)}`]()
    })

    if (!this.formReady) {
      alert('Vui lòng kiểm tra lại thông tin.')
      return
    }
    console.table(this.form)
    alert('Đăng ký thành công!')
  },

  _title (s) { return s.charAt(0).toUpperCase() + s.slice(1) }
}))

Alpine.start()

