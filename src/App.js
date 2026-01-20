import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Trash2, Edit, Search, AlertTriangle, Save, X, Filter, CheckCircle, 
  Package, History, Mail, ArrowRight, ArrowDownRight, ArrowUpRight, User, 
  BookOpen, Lock, LogOut, Key, Users, UserPlus, Settings, CloudDownload, 
  FileSpreadsheet, Loader2, ChevronDown, ChevronUp, RefreshCw, Send, Info, 
  Copy, Truck, Archive, MinusCircle, PlusCircle, ClipboardCheck, Database,
  FileText, Tag, PenTool, ExternalLink, List, Ruler, Wrench,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';

// ==========================================
// 【設定】ここにGASのウェブアプリURLを貼り付けてください
const API_URL = "https://script.google.com/macros/s/AKfycbzul0Gq9yzbq060wTrW02XwnaJFxtIwxqDCwQf3KNUOFpIYCwJZnw8cYBiuK21kwBzlcw/exec"; 
// ==========================================

// --- 初期ユーザー設定 ---
const INITIAL_USERS = [
  { id: 'u1', name: '鈴木', password: '1234' },
  { id: 'u2', name: '田中', password: '5678' },
  { id: 'u3', name: '管理者', password: 'admin' },
];

const INITIAL_FORM_STATE = {
  partNumber: '', manufacturer: '', series: '', 
  shape: 'スクエア', type: '超硬', lengthType: 'ショート', 
  flutes: '', diameter: '', radius: '', effectiveLength: '', fluteLength: '', 
  usage: '', 
  stock: '', reorderPoint: ''
};

// 固定の選択肢は廃止し、データから動的に生成します
// (初回起動時に空にならないよう、カタログデータに基本的なものは含めておく設計です)

// --- カタログ初期データ ---
const INITIAL_CATALOG_DATA = [
  { id: 'c1', partNumber: 'MSE430 4', manufacturer: '日進工具', series: '無限コーティング', shape: 'スクエア', type: '超硬', lengthType: 'ショート', flutes: 4, diameter: 4, radius: 0, effectiveLength: 12, fluteLength: 8, usage: '一般鋼荒加工' },
  { id: 'c2', partNumber: 'MRB230 R1x10', manufacturer: '日進工具', series: '無限コーティング', shape: 'ボール', type: '超硬', lengthType: 'ロング', flutes: 2, diameter: 2, radius: 1, effectiveLength: 10, fluteLength: 1.5, usage: '曲面仕上げ' },
  { id: 'c3', partNumber: 'TSC-PEM4-4', manufacturer: 'ミスミ', series: 'TSC', shape: 'スクエア', type: '超硬', lengthType: '3D', flutes: 4, diameter: 4, radius: 0, effectiveLength: 12, fluteLength: 10, usage: '' },
  { id: 'c4', partNumber: 'TSC-EB2-R1', manufacturer: 'ミスミ', series: 'TSC', shape: 'ボール', type: '超硬', lengthType: 'ショート', flutes: 2, diameter: 2, radius: 1, effectiveLength: 6, fluteLength: 3, usage: '' },
  { id: 'c5', partNumber: 'T-SQ4-040', manufacturer: 'TOWA', series: 'T-Series', shape: 'スクエア', type: '超硬', lengthType: '3D', flutes: 4, diameter: 4, radius: 0, effectiveLength: 12, fluteLength: 10, usage: '' },
  { id: 'c6', partNumber: 'AE-VMS 6', manufacturer: 'OSG', series: 'AE-VMS', shape: 'スクエア', type: '超硬', lengthType: '3D', flutes: 4, diameter: 6, radius: 0, effectiveLength: 18, fluteLength: 13, usage: '多目的加工' },
  { id: 'c7', partNumber: 'WXL-LN-EBD R0.5x4', manufacturer: 'OSG', series: 'WXL', shape: 'ボール', type: '超硬', lengthType: '4D', flutes: 2, diameter: 1, radius: 0.5, effectiveLength: 4, fluteLength: 0.8, usage: 'リブ加工' },
];

// --- Web取込シミュレーション用 追加データ ---
const WEB_CATALOG_DATA = [
  // 日進工具
  { partNumber: 'MHR430R 2xR0.2x12', manufacturer: '日進工具', series: '無限コーティング', shape: 'ラジアス', type: '超硬', flutes: 4, diameter: 2, radius: 0.2, effectiveLength: 12, fluteLength: 1.6, usage: 'コーナーR' },
  { partNumber: 'MSE230 2', manufacturer: '日進工具', series: '無限コーティング', shape: 'スクエア', type: '超硬', flutes: 2, diameter: 2, radius: 0, effectiveLength: 6, fluteLength: 4, usage: '溝加工' },
  { partNumber: 'AL-3D-2 3', manufacturer: '日進工具', series: 'アルミ用', shape: 'スクエア', type: '超硬', flutes: 2, diameter: 3, radius: 0, effectiveLength: 9, fluteLength: 6, usage: 'アルミ加工' },
  // OSG
  { partNumber: 'AE-VMS 8', manufacturer: 'OSG', series: 'AE-VMS', shape: 'スクエア', type: '超硬', flutes: 4, diameter: 8, radius: 0, effectiveLength: 24, fluteLength: 19, usage: '高能率加工' },
  { partNumber: 'WX-LN-EDS 1x4', manufacturer: 'OSG', series: 'WXコート', shape: 'スクエア', type: '超硬', flutes: 2, diameter: 1, radius: 0, effectiveLength: 4, fluteLength: 1.5, usage: '微細加工' },
  { partNumber: 'FX-MG-EDL 10', manufacturer: 'OSG', series: 'FXコート', shape: 'スクエア', type: '超硬', flutes: 2, diameter: 10, radius: 0, effectiveLength: 30, fluteLength: 25, usage: '深彫り' },
  // ミスミ
  { partNumber: 'TSC-PEM4-6', manufacturer: 'ミスミ', series: 'TSC', shape: 'スクエア', type: '超硬', flutes: 4, diameter: 6, radius: 0, effectiveLength: 18, fluteLength: 15, usage: '汎用' },
  { partNumber: 'TSC-MS-2', manufacturer: 'ミスミ', series: 'TSC', shape: 'スクエア', type: 'ハイス', flutes: 2, diameter: 2, radius: 0, effectiveLength: 6, fluteLength: 4, usage: 'コスト重視' },
  // TOWA
  { partNumber: 'T-BL2-R2', manufacturer: 'TOWA', series: 'T-Series', shape: 'ボール', type: '超硬', flutes: 2, diameter: 4, radius: 2, effectiveLength: 10, fluteLength: 6, usage: '倣い加工' },
  { partNumber: 'T-HL2-030', manufacturer: 'TOWA', series: 'ハード', shape: 'スクエア', type: '超硬', flutes: 2, diameter: 3, radius: 0, effectiveLength: 8, fluteLength: 5, usage: '高硬度材' },
];

// --- 初期データ (在庫) ---
const INITIAL_DATA = [
  { id: '1', partNumber: 'MSE430 4', shape: 'スクエア', type: '超硬', lengthType: 'ショート', diameter: 4, radius: 0, flutes: 4, effectiveLength: 12, fluteLength: 8, series: '無限コーティング', manufacturer: '日進工具', stock: 5, reorderPoint: 3, isOrdered: false, usage: '側面仕上げ' },
  { id: '2', partNumber: 'AE-VMS 6', shape: 'スクエア', type: '超硬', lengthType: '3D', diameter: 6, radius: 0, flutes: 4, effectiveLength: 18, fluteLength: 13, series: 'AE-VMS', manufacturer: 'OSG', stock: 1, reorderPoint: 3, isOrdered: false, usage: '荒加工用' },
];

const INITIAL_LOGS = [
  { id: 'log1', date: new Date(Date.now() - 86400000).toISOString(), type: 'register', partNumber: 'MSE430 4', diff: 5, stockAfter: 5, operator: '鈴木' },
  { id: 'log2', date: new Date(Date.now() - 43200000).toISOString(), type: 'out', partNumber: 'AE-VMS 6', diff: -2, stockAfter: 1, operator: '田中' },
];

export default function EndMillManager() {
  const [items, setItems] = useState([]);
  const [transactionLog, setTransactionLog] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [catalogItems, setCatalogItems] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [formMode, setFormMode] = useState('register');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTargetItem, setStockTargetItem] = useState(null);
  const [stockOperation, setStockOperation] = useState({ type: 'in', quantity: 1 });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true); 
  const [csvText, setCsvText] = useState('');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // マスタ管理(データ整理)用 State
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceField, setMaintenanceField] = useState('manufacturer'); // manufacturer, shape, type, etc.
  const [renameTarget, setRenameTarget] = useState('');
  const [renameNewValue, setRenameNewValue] = useState('');

  const [catalogFilters, setCatalogFilters] = useState({ manufacturer: '', series: '', shape: '', flutes: '', diameter: '', radius: '', effectiveLength: '', fluteLength: '' });
  const [inventoryFilters, setInventoryFilters] = useState({ manufacturer: '', series: '', shape: '', flutes: '', diameter: '', radius: '', effectiveLength: '', fluteLength: '' });
  const [showInventoryFilters, setShowInventoryFilters] = useState(false);
  const [logFilterQuery, setLogFilterQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [currentUser, setCurrentUser] = useState(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserManageModal, setShowUserManageModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ userId: '', password: '' });
  const [newUserForm, setNewUserForm] = useState({ name: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info', actionLabel: '', onAction: null, isProcessing: false });

  // --- Logic Helpers ---
  const showNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const showAlert = (title, message, type = 'info', actionLabel = null, onAction = null) => {
    setAlertModal({ show: true, title, message, type, actionLabel, onAction, isProcessing: false });
  };
  const closeAlert = () => setAlertModal(prev => ({ ...prev, show: false, isProcessing: false }));
  const handleAlertAction = async () => {
    if (!alertModal.onAction || alertModal.isProcessing) return;
    setAlertModal(prev => ({ ...prev, isProcessing: true }));
    await alertModal.onAction();
  };

  // --- Dynamic Options Helper ---
  const getDynamicOptions = (field) => {
    const itemValues = items.map(i => i[field]).filter(v => v);
    const catalogValues = catalogItems.map(c => c[field]).filter(v => v);
    const allValues = new Set([...itemValues, ...catalogValues]);
    return Array.from(allValues).sort();
  };

  const dynamicManufacturerOptions = useMemo(() => getDynamicOptions('manufacturer'), [items, catalogItems]);
  const dynamicSeriesOptions = useMemo(() => getDynamicOptions('series'), [items, catalogItems]);
  const dynamicShapeOptions = useMemo(() => getDynamicOptions('shape'), [items, catalogItems]);
  const dynamicMaterialOptions = useMemo(() => getDynamicOptions('type'), [items, catalogItems]);
  const dynamicLengthTypeOptions = useMemo(() => getDynamicOptions('lengthType'), [items, catalogItems]);

  // --- API Functions ---
  const fetchData = useCallback(async () => {
    if (!API_URL) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=getAll`);
      const data = await response.json();
      if (data.items) setItems(data.items);
      if (data.logs) setTransactionLog(data.logs);
      if (data.users && data.users.length > 0) setUsers(data.users);
      if (data.catalog) setCatalogItems(data.catalog);
    } catch (error) {
      console.error("Data fetch error:", error);
      showNotification("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const postData = async (action, sheetName, payload) => {
    if (!API_URL) {
      showAlert("設定エラー", "API URLが設定されていません。", "error");
      return false;
    }
    setIsSyncing(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action, sheet: sheetName, data: payload })
      });
      const result = await response.json();
      if (result.status === 'success') {
        await fetchData();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Data post error:", error);
      showAlert("通信エラー", "データの保存に失敗しました。\n" + error.message, "error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (API_URL) fetchData();
  }, [fetchData]);

  // --- Filter Logic ---
  const getOptions = (sourceItems, filters, field) => {
    const otherFilters = Object.entries(filters).filter(([k, v]) => k !== field && v !== '');
    const filtered = sourceItems.filter(item => otherFilters.every(([k, v]) => String(item[k]) === String(v)));
    const values = [...new Set(filtered.map(item => item[field]))];
    return values.filter(v => v !== '' && v !== undefined && v !== null)
                 .sort((a, b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b)));
  };

  const filteredCatalogItems = useMemo(() => {
    let filtered = catalogItems;
    if (catalogSearchQuery) {
      const query = catalogSearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.partNumber.toLowerCase().includes(query) || 
        item.manufacturer.toLowerCase().includes(query)
      );
    }
    const activeFilters = Object.entries(catalogFilters).filter(([_, v]) => v !== '');
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => activeFilters.every(([k, v]) => String(item[k]) === String(v)));
    }
    return filtered;
  }, [catalogItems, catalogFilters, catalogSearchQuery]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchWords = searchQuery.toLowerCase().split(/\s+/);
      const itemString = Object.values(item).join(' ').toLowerCase();
      const matchesKeyword = searchWords.every(word => itemString.includes(word));
      if (!matchesKeyword) return false;
      const activeFilters = Object.entries(inventoryFilters).filter(([_, v]) => v !== '');
      return activeFilters.every(([k, v]) => String(item[k]) === String(v));
    });
  }, [items, searchQuery, inventoryFilters]);

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1); // フィルターが変わったら1ページ目に戻す
  }, [searchQuery, inventoryFilters]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!logFilterQuery) return transactionLog;
    return transactionLog.filter(log => 
      log.partNumber.toLowerCase().includes(logFilterQuery.toLowerCase()) || 
      (log.operator && log.operator.toLowerCase().includes(logFilterQuery.toLowerCase()))
    );
  }, [transactionLog, logFilterQuery]);

  // --- Change Detection Logic ---
  const isFormChanged = useMemo(() => {
    if (formMode !== 'edit' || !editingId) return true; 
    const originalItem = items.find(i => i.id === editingId);
    if (!originalItem) return false;

    const fieldsToCheck = [
      'partNumber', 'manufacturer', 'series', 'shape', 'type', 'lengthType',
      'flutes', 'diameter', 'radius', 'effectiveLength', 'fluteLength', 
      'usage', 'reorderPoint'
    ];

    return fieldsToCheck.some(field => {
      const val1 = String(originalItem[field] ?? '');
      const val2 = String(formData[field] ?? '');
      return val1 !== val2;
    });
  }, [formMode, editingId, items, formData]);


  // Handlers
  const handleCatalogFilterChange = (field, value) => setCatalogFilters(prev => ({ ...prev, [field]: value }));
  const handleInventoryFilterChange = (field, value) => setInventoryFilters(prev => ({ ...prev, [field]: value }));
  const handleResetCatalogFilters = () => {
    setCatalogFilters({ manufacturer: '', series: '', shape: '', flutes: '', diameter: '', radius: '', effectiveLength: '', fluteLength: '' });
    setCatalogSearchQuery('');
  };
  const handleResetInventoryFilters = () => { setInventoryFilters({ manufacturer: '', series: '', shape: '', flutes: '', diameter: '', radius: '', effectiveLength: '', fluteLength: '' }); setSearchQuery(''); };

  const handleApplyCatalogItem = (item) => {
    setFormData(prev => ({
      ...prev,
      partNumber: item.partNumber,
      manufacturer: item.manufacturer,
      series: item.series,
      shape: item.shape,
      type: item.type || '超硬', 
      lengthType: item.lengthType || '',
      flutes: item.flutes,
      diameter: item.diameter,
      radius: item.radius,
      effectiveLength: item.effectiveLength,
      fluteLength: item.fluteLength,
      usage: item.usage || '' 
    }));
  };

  const handleGoogleSearch = (partNumber) => {
    if (!partNumber) return;
    const query = encodeURIComponent(`${partNumber} エンドミル`);
    const width = 1000;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(`https://www.google.com/search?q=${query}`, 'ProductSearch', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };
  
  // Auth
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.name === loginForm.userId && String(u.password) === String(loginForm.password));
    if (user) {
      setCurrentUser(user);
      setShowLoginModal(false);
      setLoginError('');
      setLoginForm({ userId: '', password: '' });
    } else {
      setLoginError('認証に失敗しました');
    }
  };
  const handleLogout = () => {
    setCurrentUser(null);
    handleClear();
    setShowUserManageModal(false);
    setShowCatalogModal(false);
    setShowStockModal(false);
    setShowHistoryModal(false);
    setShowMaintenanceModal(false);
  };

  // User Management
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.password) return;
    const success = await postData('add', 'users', { name: newUserForm.name, password: newUserForm.password });
    if (success) {
      setNewUserForm({ name: '', password: '' });
      showNotification('ユーザーを追加しました');
    }
  };
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) { showAlert('エラー', '自分自身は削除できません', 'error'); return; }
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.name === '管理者') { showAlert('エラー', '管理者は削除できません', 'error'); return; }
    if(await postData('delete', 'users', { id: userId })) {
      showNotification('ユーザーを削除しました');
    }
  };

  // Maintenance (Batch Update)
  const handleBatchRename = async () => {
    if (!renameTarget || !renameNewValue) return;
    if (!window.confirm(`「${renameTarget}」を「${renameNewValue}」に一括変更します。\nこの操作は元に戻せません。よろしいですか？`)) return;

    setIsSyncing(true);
    let updatedCount = 0;

    try {
      // 1. 在庫アイテムの更新
      const targetItems = items.filter(i => i[maintenanceField] === renameTarget);
      for (const item of targetItems) {
         await postData('update', 'items', { id: item.id, [maintenanceField]: renameNewValue });
         updatedCount++;
      }

      // 2. カタログの更新
      const targetCatalog = catalogItems.filter(c => c[maintenanceField] === renameTarget);
      for (const item of targetCatalog) {
         await postData('update', 'catalog', { id: item.id, [maintenanceField]: renameNewValue });
         updatedCount++;
      }

      showNotification(`${updatedCount}件のデータを更新しました`);
      setRenameTarget('');
      setRenameNewValue('');
    } catch (e) {
      console.error(e);
      showAlert('エラー', '更新中にエラーが発生しました', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Catalog Ops
  const handleFetchWebCatalog = () => {
    setIsCatalogLoading(true);
    setTimeout(async () => {
       showAlert('デモ機能', '実際のWebクローリングは実装されていませんが、CSVインポートでデータを一括登録できます。', 'info');
       setIsCatalogLoading(false);
    }, 1000);
  };

  const handleCsvImport = async () => {
    if (!csvText) return;
    try {
      const lines = csvText.trim().split('\n');
      const newCatalogItems = lines.map((line) => {
        const cols = line.split(',');
        if (cols.length < 2) return null; 
        return {
          partNumber: cols[0]?.trim(), manufacturer: cols[1]?.trim(), series: cols[2]?.trim() || '', 
          shape: cols[3]?.trim() || 'スクエア', type: cols[4]?.trim() || '超硬', lengthType: cols[5]?.trim() || '',
          flutes: Number(cols[6]) || 0, diameter: Number(cols[7]) || 0, radius: Number(cols[8]) || 0, effectiveLength: Number(cols[9]) || 0, fluteLength: Number(cols[10]) || 0,
          usage: cols[11]?.trim() || ''
        };
      }).filter(Boolean);
      const success = await postData('addBatch', 'catalog', newCatalogItems);
      if (success) {
        setCsvText('');
        showAlert('インポート完了', `${newCatalogItems.length}件のデータをインポートしました`, 'info');
      }
    } catch (e) {
      showAlert('エラー', 'CSVの形式が正しくありません', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleClear = () => {
    setFormData(INITIAL_FORM_STATE);
    setFormMode('register');
    setEditingId(null);
  };

  // Mail / Alert
  const executeMailAction = (itemsToReport) => {
    const subject = "【発注依頼】エンドミル在庫不足アラート";
    let bodyText = `件名: ${subject}\n\n担当者様\n(発信者: ${currentUser ? currentUser.name : '不明'})\n\n以下の在庫が発注点を下回りました。手配をお願い致します。\n\n`;
    bodyText += "--------------------------------------------------\n";
    itemsToReport.forEach((item) => {
      bodyText += `[${item.manufacturer}] ${item.partNumber}\n`;
      bodyText += `   現在庫: ${item.stock} / 発注点: ${item.reorderPoint}\n`;
      bodyText += `   形状: ${item.shape} (${item.type}) D${item.diameter}\n`;
      if(item.usage) bodyText += `   用途: ${item.usage}\n`;
      bodyText += "\n";
    });
    bodyText += "--------------------------------------------------\n";
    
    const textArea = document.createElement("textarea");
    textArea.value = bodyText;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) showNotification('メール本文をクリップボードにコピーしました');
    } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
  };

  const markAsOrdered = async (targetItems) => {
    for (const item of targetItems) {
      await postData('update', 'items', { id: item.id, isOrdered: true });
    }
  };

  const triggerStockAlert = (item) => {
    showAlert(
      '在庫不足アラート',
      `「${item.partNumber}」の在庫(${item.stock}個)が発注点(${item.reorderPoint}個)を下回りました。\n発注メールの本文をクリップボードにコピーし、履歴に「発注依頼」として記録しますか？`,
      'warning',
      'コピー＆依頼済にする',
      async () => {
        executeMailAction([item]);
        await postData('add', 'logs', {
          date: new Date().toISOString(), type: 'mail', partNumber: item.partNumber, diff: 0, stockAfter: item.stock, operator: currentUser.name
        });
        await postData('update', 'items', { id: item.id, isOrdered: true });
        closeAlert();
      }
    );
  };

  const unorderedLowStockItems = items.filter(item => item.stock <= item.reorderPoint && !item.isOrdered);
  const orderedLowStockItems = items.filter(item => item.stock <= item.reorderPoint && item.isOrdered);

  const handleSendMail = () => {
    if (unorderedLowStockItems.length === 0) return;
    showAlert(
      '一括発注依頼',
      `警告中の${unorderedLowStockItems.length}件についてメール本文をコピーし、\n履歴に「発注依頼」として記録しますか？`,
      'info',
      'コピー＆依頼済にする',
      async () => {
        executeMailAction(unorderedLowStockItems);
        for (const item of unorderedLowStockItems) {
          await postData('add', 'logs', {
            date: new Date().toISOString(), type: 'mail', partNumber: item.partNumber, diff: 0, stockAfter: item.stock, operator: currentUser.name
          });
        }
        await markAsOrdered(unorderedLowStockItems);
        closeAlert();
      }
    );
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (formMode === 'register') {
      const processedData = { ...formData };
      ['diameter', 'radius', 'flutes', 'effectiveLength', 'fluteLength', 'stock', 'reorderPoint'].forEach(k => processedData[k] = Number(processedData[k]) || 0);

      const success = await postData('add', 'items', { ...processedData, isOrdered: false });
      if (success) {
        await postData('add', 'logs', { date: new Date().toISOString(), type: 'register', partNumber: processedData.partNumber, diff: processedData.stock, stockAfter: processedData.stock, operator: currentUser.name });
        showNotification('新規登録しました');
        if (processedData.stock <= processedData.reorderPoint) setTimeout(() => triggerStockAlert(processedData), 500);
        handleClear();
      }
    } 
    else if (formMode === 'edit' && editingId) {
      const processedData = { ...formData };
      ['diameter', 'radius', 'flutes', 'effectiveLength', 'fluteLength', 'reorderPoint'].forEach(k => processedData[k] = Number(processedData[k]) || 0);
      delete processedData.stock;
      delete processedData.isOrdered;

      const currentItem = items.find(i => i.id === editingId);
      
      const success = await postData('update', 'items', { id: editingId, ...processedData });
      if (success) {
        await postData('add', 'logs', { date: new Date().toISOString(), type: 'edit', partNumber: processedData.partNumber, diff: 0, stockAfter: currentItem.stock, operator: currentUser.name });
        showNotification('情報を更新しました');
        handleClear();
      }
    }
  };

  // Stock Op
  const openStockModal = (item) => {
    setStockTargetItem(item);
    setStockOperation({ type: 'in', quantity: 1 });
    setShowStockModal(true);
  };

  // History Op
  const openHistoryModal = (item) => {
    setHistoryTargetItem(item);
    setShowHistoryModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockTargetItem) return;

    const qty = Number(stockOperation.quantity);
    if (stockOperation.type !== 'set' && qty <= 0) return showAlert('エラー', '数量は1以上を入力してください', 'error');
    if (stockOperation.type === 'set' && qty < 0) return showAlert('エラー', '在庫数は0以上を入力してください', 'error');

    let newStock = 0;
    let diff = 0;
    if (stockOperation.type === 'set') {
        newStock = qty;
        diff = newStock - stockTargetItem.stock;
    } else {
        diff = stockOperation.type === 'in' ? qty : -qty;
        newStock = stockTargetItem.stock + diff;
    }

    if (newStock < 0) return showAlert('エラー', '在庫数がマイナスになります', 'error');

    const updateData = { id: stockTargetItem.id, stock: newStock };
    if (diff > 0) updateData.isOrdered = false;

    const success = await postData('update', 'items', updateData);
    if (success) {
      const logType = stockOperation.type === 'set' ? 'edit' : stockOperation.type;
      await postData('add', 'logs', { date: new Date().toISOString(), type: logType, partNumber: stockTargetItem.partNumber, diff: diff, stockAfter: newStock, operator: currentUser.name });
      
      const newItemData = { ...stockTargetItem, ...updateData };
      if (diff < 0 && newStock <= newItemData.reorderPoint && !newItemData.isOrdered) {
         setTimeout(() => triggerStockAlert(newItemData), 500);
      }
      setShowStockModal(false);
      showNotification('在庫を更新しました');
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setFormMode('edit');
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!currentUser) return;
    const targetItem = items.find(item => item.id === id);
    if (!window.confirm('本当に削除しますか？')) return;

    const success = await postData('delete', 'items', { id });
    if (success) {
      if (targetItem) await postData('add', 'logs', { date: new Date().toISOString(), type: 'delete', partNumber: targetItem.partNumber, diff: -targetItem.stock, stockAfter: 0, operator: currentUser.name });
      if (editingId === id) handleClear();
      showNotification('削除しました');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!API_URL) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Database className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">API URLの設定が必要です</h2>
        <p className="text-slate-500 max-w-md mb-6">ソースコードの <code>const API_URL = "";</code> にURLを設定してください。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* Loading Overlay */}
      {(isLoading || isSyncing) && (
        <div className="fixed inset-0 bg-white/50 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="font-bold text-slate-700">{isSyncing ? '送信中...' : '読み込み中...'}</span>
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      {/* Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in relative">
            <button type="button" onClick={closeAlert} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-4 ${alertModal.type === 'warning' ? 'bg-orange-100 text-orange-500' : alertModal.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                {alertModal.type === 'warning' ? <AlertTriangle className="w-8 h-8" /> : alertModal.type === 'error' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{alertModal.title}</h3>
              <p className="text-slate-600 mb-6 whitespace-pre-wrap">{alertModal.message}</p>
              <div className="flex gap-3 w-full">
                <button type="button" onClick={closeAlert} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors">閉じる</button>
                {alertModal.actionLabel && alertModal.onAction && (
                  <button 
                    type="button" 
                    onClick={handleAlertAction} 
                    disabled={alertModal.isProcessing}
                    className={`flex-1 py-2.5 rounded-lg text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 ${alertModal.isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {alertModal.isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Copy className="w-4 h-4" />}
                    {alertModal.isProcessing ? '処理中...' : alertModal.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal (New!) */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-bounce-in">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700"><Wrench className="w-5 h-5 text-slate-600" /> データ整理（選択肢の編集）</h3>
               <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
             </div>
             <p className="text-xs text-slate-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-200">
               登録済みの単語を一括で書き換えます。間違って登録した選択肢の修正や統合に使用します。<br/>
               （例: 「ハイス鋼」を「ハイス」に統一するなど）
             </p>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">対象の項目</label>
                 <select 
                   value={maintenanceField} 
                   onChange={(e) => { setMaintenanceField(e.target.value); setRenameTarget(''); }} 
                   className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                 >
                   <option value="manufacturer">メーカー</option>
                   <option value="series">シリーズ</option>
                   <option value="shape">形状</option>
                   <option value="type">材質</option>
                   <option value="lengthType">タイプ(長さ)</option>
                   <option value="usage">用途</option>
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">修正したい単語を選択</label>
                 <div className="flex gap-2">
                   <select 
                     value={renameTarget} 
                     onChange={(e) => { setRenameTarget(e.target.value); setRenameNewValue(e.target.value); }}
                     className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                   >
                     <option value="">選択してください...</option>
                     {getDynamicOptions(maintenanceField).map(opt => (
                       <option key={opt} value={opt}>{opt}</option>
                     ))}
                   </select>
                   <ArrowRight className="w-5 h-5 text-slate-400 mt-2" />
                   <input 
                     type="text" 
                     value={renameNewValue} 
                     onChange={(e) => setRenameNewValue(e.target.value)}
                     className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                     placeholder="新しい名称"
                   />
                 </div>
               </div>

               <button 
                 onClick={handleBatchRename}
                 disabled={!renameTarget || !renameNewValue || renameTarget === renameNewValue || isSyncing}
                 className={`w-full py-3 rounded-lg font-bold text-white shadow-sm flex items-center justify-center gap-2 ${
                   !renameTarget || !renameNewValue || renameTarget === renameNewValue || isSyncing
                   ? 'bg-slate-300 cursor-not-allowed'
                   : 'bg-indigo-600 hover:bg-indigo-700'
                 }`}
               >
                 {isSyncing ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4" />}
                 {isSyncing ? '更新中...' : '一括置換を実行'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* History Detail Modal */}
      {showHistoryModal && historyTargetItem && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-bounce-in max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600" /> 入出庫履歴詳細</h3>
                <div className="text-xs text-slate-500 mt-1">
                  {historyTargetItem.manufacturer} <span className="font-bold text-slate-700 text-sm mx-1">{historyTargetItem.partNumber}</span>
                  ({historyTargetItem.shape} / {historyTargetItem.type})
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs sticky top-0">
                  <tr><th className="px-4 py-2">日時</th><th className="px-4 py-2">担当者</th><th className="px-4 py-2">操作</th><th className="px-4 py-2 text-right">変動数</th><th className="px-4 py-2 text-right">在庫残</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactionLog.filter(log => log.partNumber === historyTargetItem.partNumber).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500 text-xs font-mono">{formatDate(log.date)}</td>
                      <td className="px-4 py-2"><span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium"><User className="w-3 h-3" /> {log.operator || '不明'}</span></td>
                      <td className="px-4 py-2">
                         {log.type === 'in' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold"><ArrowDownRight className="w-3 h-3"/>入庫</span>}
                         {log.type === 'out' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold"><ArrowUpRight className="w-3 h-3"/>出庫</span>}
                         {log.type === 'set' && <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold"><ClipboardCheck className="w-3 h-3"/>棚卸</span>}
                         {log.type === 'register' && <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold"><Plus className="w-3 h-3"/>新規</span>}
                         {log.type === 'delete' && <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold"><Trash2 className="w-3 h-3"/>削除</span>}
                         {log.type === 'edit' && <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold"><Edit className="w-3 h-3"/>修正</span>}
                         {log.type === 'mail' && <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs font-bold"><Send className="w-3 h-3"/>発注依頼</span>}
                      </td>
                      <td className="px-4 py-2 text-right">{log.diff !== 0 ? (log.diff > 0 ? `+${log.diff}` : log.diff) : '-'}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-600">{log.type === 'delete' ? '-' : log.stockAfter}</td>
                    </tr>
                  ))}
                  {transactionLog.filter(log => log.partNumber === historyTargetItem.partNumber).length === 0 && (<tr><td colSpan="5" className="p-8 text-center text-slate-400">履歴はありません</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stock Operation Modal */}
      {showStockModal && stockTargetItem && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in relative">
            <button type="button" onClick={() => setShowStockModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2"><Archive className="w-5 h-5"/> 入出庫・在庫修正</h3>
            <p className="text-xs text-slate-500 mb-4">{stockTargetItem.manufacturer} {stockTargetItem.partNumber}</p>
            <form onSubmit={handleStockSubmit}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <label className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition-colors ${stockOperation.type === 'in' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-green-200'}`}>
                  <input type="radio" name="opType" className="hidden" checked={stockOperation.type === 'in'} onChange={() => setStockOperation({...stockOperation, type: 'in'})} />
                  <PlusCircle className={`w-5 h-5 ${stockOperation.type === 'in' ? 'text-green-600' : 'text-slate-300'}`} />
                  <span className="font-bold text-xs">入庫</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition-colors ${stockOperation.type === 'out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:border-red-200'}`}>
                  <input type="radio" name="opType" className="hidden" checked={stockOperation.type === 'out'} onChange={() => setStockOperation({...stockOperation, type: 'out'})} />
                  <MinusCircle className={`w-5 h-5 ${stockOperation.type === 'out' ? 'text-red-600' : 'text-slate-300'}`} />
                  <span className="font-bold text-xs">出庫</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition-colors ${stockOperation.type === 'set' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-200'}`}>
                  <input type="radio" name="opType" className="hidden" checked={stockOperation.type === 'set'} onChange={() => setStockOperation({...stockOperation, type: 'set'})} />
                  <ClipboardCheck className={`w-5 h-5 ${stockOperation.type === 'set' ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <span className="font-bold text-xs">修正(棚卸)</span>
                </label>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">{stockOperation.type === 'set' ? '修正後の在庫数' : '数量'}</span>
                  <span className="text-xs text-slate-400">現在庫: {stockTargetItem.stock}</span>
                </div>
                <input type="number" min={stockOperation.type === 'set' ? "0" : "1"} value={stockOperation.quantity} onChange={(e) => setStockOperation({...stockOperation, quantity: Math.max(0, parseInt(e.target.value) || 0)})} className="w-full text-center text-3xl font-bold p-2 border border-slate-300 rounded focus:ring-4 focus:ring-indigo-100 outline-none bg-white" autoFocus />
                <div className="text-center mt-2 text-sm font-bold text-slate-600">
                  {stockOperation.type === 'set' ? (
                    <>修正: {stockTargetItem.stock} <ArrowRight className="w-3 h-3 inline mx-1"/> <span className={stockOperation.quantity <= stockTargetItem.reorderPoint ? 'text-red-600' : 'text-green-600'}>{stockOperation.quantity}</span></>
                  ) : (
                    <>変移: {stockTargetItem.stock} <ArrowRight className="w-3 h-3 inline mx-1"/> <span className={(stockOperation.type === 'in' ? stockTargetItem.stock + stockOperation.quantity : stockTargetItem.stock - stockOperation.quantity) <= stockTargetItem.reorderPoint ? 'text-red-600' : 'text-green-600'}>{stockOperation.type === 'in' ? stockTargetItem.stock + stockOperation.quantity : stockTargetItem.stock - stockOperation.quantity}</span></>
                  )}
                </div>
              </div>
              <button type="submit" className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95 ${stockOperation.type === 'in' ? 'bg-green-600 hover:bg-green-700' : stockOperation.type === 'out' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>実行する</button>
            </form>
          </div>
        </div>
      )}

      {/* Login, Catalog, User Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold flex items-center gap-2 text-slate-700"><Lock className="w-5 h-5 text-blue-600" />ログイン</h3><button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">担当者</label><select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={loginForm.userId} onChange={(e) => setLoginForm({...loginForm, userId: e.target.value})} required><option value="">選択してください</option>{users.map(u => (<option key={u.id} value={u.name}>{u.name}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">パスワード</label><div className="relative"><Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg" placeholder="パスワード" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} required /></div></div>
              {loginError && (<div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{loginError}</div>)}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md">ログインする</button>
            </form>
          </div>
        </div>
      )}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-bounce-in max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold flex items-center gap-2 text-slate-700"><BookOpen className="w-5 h-5 text-indigo-600" />カタログ・マスターデータ管理</h3><button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200"><h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-green-500" />CSV一括インポート</h4><textarea className="w-full h-20 p-2 text-xs border border-slate-300 rounded mb-2" placeholder={`記述例:\n品番,メーカー,シリーズ,形状,タイプ,長さタイプ,刃数,工具径,R寸法,有効長,刃長,用途\n\nMSE430 4,日進工具,無限コーティング,スクエア,超硬,ショート,4,4,0,12,8,仕上げ用`} value={csvText} onChange={(e) => setCsvText(e.target.value)}/><button onClick={handleCsvImport} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow-sm text-sm">インポート実行</button></div>
            </div>
          </div>
        </div>
      )}
      {showUserManageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-bounce-in">
             <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2 text-slate-700"><Users className="w-5 h-5 text-slate-600" />ユーザー管理</h3><button onClick={() => setShowUserManageModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="mb-6"><form onSubmit={handleAddUser} className="flex gap-2"><input type="text" placeholder="名前" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} required/><input type="text" placeholder="パスワード" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} required/><button type="submit" className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"><UserPlus className="w-5 h-5" /></button></form></div>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">{users.map(u => (<div key={u.id} className="flex items-center justify-between p-3 bg-slate-50"><div className="flex items-center gap-3"><div className="bg-slate-200 p-1.5 rounded-full"><User className="w-4 h-4 text-slate-500" /></div><div className="font-bold text-sm text-slate-700">{u.name}</div></div>{u.name !== '管理者' && u.id !== currentUser?.id && (<button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>)}</div>))}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><Package className="w-6 h-6 text-blue-400" /><h1 className="text-xl font-bold tracking-wide">エンドミル在庫管理</h1><button onClick={fetchData} className="ml-2 text-slate-400 hover:text-white" title="再読み込み"><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/></button></div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-end">
             <div className="flex items-center gap-3">
               {currentUser ? (
                 <div className="flex items-center gap-2 bg-slate-700 px-4 py-1.5 rounded-lg border border-slate-600"><User className="w-4 h-4 text-green-400" /><span className="text-sm font-bold text-white">{currentUser.name}</span>
                 {/* データ整理ボタン（管理者のみ） */}
                 {currentUser.name === '管理者' && (
                     <>
                        <button onClick={() => setShowUserManageModal(true)} className="ml-2 px-2 border-l border-slate-500 text-slate-300 hover:text-white transition-colors" title="ユーザー管理"><Settings className="w-4 h-4" /></button>
                        <button onClick={() => setShowMaintenanceModal(true)} className="ml-2 px-2 border-l border-slate-500 text-slate-300 hover:text-white transition-colors" title="データ整理"><Wrench className="w-4 h-4" /></button>
                     </>
                 )}
                 <button onClick={handleLogout} className="ml-2 pl-2 border-l border-slate-500 text-xs text-slate-400 hover:text-white flex items-center gap-1"><LogOut className="w-3 h-3" /> ログアウト</button></div>
               ) : (
                 <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-md"><Lock className="w-4 h-4" /> ログイン</button>
               )}
             </div>
             <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full"><span>総数:</span><span className="font-bold text-white">{items.length}</span></div>
                {unorderedLowStockItems.length > 0 && currentUser && (
                  <button onClick={handleSendMail} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-full animate-pulse transition-colors shadow-lg"><AlertTriangle className="w-4 h-4" /><span className="font-bold">{unorderedLowStockItems.length}件 警告</span><Copy className="w-4 h-4 ml-1" /></button>
                )}
                {orderedLowStockItems.length > 0 && (
                  <div className="flex items-center gap-2 bg-indigo-600/30 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/50"><Truck className="w-4 h-4" /><span className="font-bold">{orderedLowStockItems.length}件 依頼済</span></div>
                )}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column: List & Search */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row gap-4 items-center">
               <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" /><input type="text" placeholder="キーワード検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
               <button onClick={() => setShowInventoryFilters(!showInventoryFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${showInventoryFilters ? 'bg-slate-200 text-slate-800' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}><Filter className="w-4 h-4" /> 詳細検索 {showInventoryFilters ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}</button>
            </div>
            {showInventoryFilters && (
               <div className="pt-3 border-t border-slate-100 animate-fade-in">
                 <div className="flex justify-between items-center mb-2"><div className="text-xs font-bold text-slate-500">スペックで絞り込む</div><button onClick={handleResetInventoryFilters} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> 条件クリア</button></div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[{ key: 'manufacturer', label: 'メーカー' }, { key: 'series', label: 'シリーズ' }, { key: 'shape', label: '形状' }, { key: 'flutes', label: '刃数' }, { key: 'diameter', label: '工具径(D)' }, { key: 'radius', label: 'R寸法' }, { key: 'effectiveLength', label: '有効長' }, { key: 'fluteLength', label: '刃長' }].map(field => (
                      <div key={field.key}><select value={inventoryFilters[field.key]} onChange={(e) => handleInventoryFilterChange(field.key, e.target.value)} className={`w-full p-2 border rounded ${inventoryFilters[field.key] ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' : 'border-slate-300 text-slate-600'}`}><option value="">{field.label}</option>{getOptions(items, inventoryFilters, field.key).map(val => (<option key={val} value={val}>{val}</option>))}</select></div>
                    ))}
                 </div>
               </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-500" /><h3 className="font-bold text-slate-700">在庫一覧 ({filteredItems.length}件)</h3></div>{!currentUser && (<span className="text-xs text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> 編集にはログインが必要です</span>)}</div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                   <tr>
                     <th className="px-4 py-3 min-w-[120px]">品番 / メーカー</th>
                     <th className="px-4 py-3">形状</th>
                     <th className="px-4 py-3 text-center">刃数</th>
                     <th className="px-4 py-3 text-right">径(D)</th>
                     <th className="px-4 py-3 text-right">R</th>
                     <th className="px-4 py-3 text-right">L1</th>
                     <th className="px-4 py-3 text-right">L</th>
                     <th className="px-4 py-3 text-center min-w-[100px]">在庫状況</th>
                     <th className="px-4 py-3 text-center w-[180px]">操作</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                   {/* ページネーション対応: filteredItems -> paginatedItems */}
                   {paginatedItems.map(item => {
                     const isLowStock = item.stock <= item.reorderPoint;
                     return (
                       <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{item.partNumber}</div>
                            <div className="text-xs text-slate-500">{item.manufacturer} {item.series && `/ ${item.series}`}</div>
                            {item.usage && <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><PenTool className="w-3 h-3"/> {item.usage}</div>}
                         </td>
                         <td className="px-4 py-3">
                            <div className="flex flex-row flex-wrap gap-1 items-center">
                              <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 whitespace-nowrap">{item.shape}</span>
                              {item.type && <span className="inline-block px-2 py-0.5 border border-slate-200 rounded text-[10px] text-slate-500 whitespace-nowrap">{item.type}</span>}
                              {item.lengthType && <span className="inline-block px-2 py-0.5 border border-slate-200 rounded text-[10px] text-slate-500 whitespace-nowrap">{item.lengthType}</span>}
                            </div>
                         </td>
                         <td className="px-4 py-3 text-center text-slate-600">{item.flutes}</td>
                         <td className="px-4 py-3 text-right font-medium">{item.diameter}</td>
                         <td className="px-4 py-3 text-right text-slate-600">{item.radius || '-'}</td>
                         <td className="px-4 py-3 text-right text-slate-600">{item.effectiveLength}</td>
                         <td className="px-4 py-3 text-right text-slate-600">{item.fluteLength}</td>
                         <td className="px-4 py-3 text-center">
                           <div className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded-lg border ${isLowStock ? (item.isOrdered ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-red-50 border-red-200 text-red-700') : 'bg-green-50 border-green-200 text-green-700'}`}>
                             <span className="font-bold text-lg leading-none">{item.stock}</span>
                           </div>
                           {isLowStock && (
                             <div className={`text-[10px] font-bold mt-1 flex items-center justify-center gap-1 ${item.isOrdered ? 'text-indigo-600' : 'text-red-600'}`}>
                               {item.isOrdered ? <><Truck className="w-3 h-3" /> 発注依頼済</> : <><AlertTriangle className="w-3 h-3" /> 発注必要</>}
                             </div>
                           )}
                         </td>
                         <td className="px-4 py-3 text-center">
                           {currentUser ? (
                             <div className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                  <button onClick={() => openStockModal(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-50 text-orange-700 font-bold rounded-lg hover:bg-orange-100 transition-colors text-xs" title="入出庫"><Archive className="w-3 h-3" /> 入出庫</button>
                                  <button onClick={() => openHistoryModal(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors text-xs" title="履歴確認"><FileText className="w-3 h-3" /> 履歴</button>
                               </div>
                               <div className="flex gap-2">
                                 <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-xs"><Edit className="w-3 h-3" /> 編集</button>
                                 <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-xs"><Trash2 className="w-3 h-3" /> 削除</button>
                               </div>
                             </div>
                           ) : <span className="text-slate-300">-</span>}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination Controls */}
             {totalPages > 1 && (
               <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 bg-slate-50">
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handlePageChange(1)} 
                     disabled={currentPage === 1}
                     className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                   >
                     <ChevronsLeft className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handlePageChange(currentPage - 1)} 
                     disabled={currentPage === 1}
                     className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                 </div>
                 <span className="text-xs text-slate-600 font-medium">
                   {currentPage} / {totalPages} ページ
                 </span>
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handlePageChange(currentPage + 1)} 
                     disabled={currentPage === totalPages}
                     className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handlePageChange(totalPages)} 
                     disabled={currentPage === totalPages}
                     className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                   >
                     <ChevronsRight className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2"><History className="w-4 h-4 text-slate-500" /><h3 className="font-bold text-slate-700">入出庫・操作履歴 (全体)</h3></div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input type="text" placeholder="品番で絞り込み..." value={logFilterQuery} onChange={(e) => setLogFilterQuery(e.target.value)} className="pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 w-32" />
              </div>
            </div>
             <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs sticky top-0">
                   <tr><th className="px-4 py-2">日時</th><th className="px-4 py-2">担当者</th><th className="px-4 py-2">操作</th><th className="px-4 py-2">品番</th><th className="px-4 py-2 text-right">変動数</th><th className="px-4 py-2 text-right">在庫残</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                   {filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50">
                       <td className="px-4 py-2 text-slate-500 text-xs font-mono">{formatDate(log.date)}</td>
                       <td className="px-4 py-2"><span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium"><User className="w-3 h-3" /> {log.operator || '不明'}</span></td>
                       <td className="px-4 py-2">
                         {log.type === 'in' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold"><ArrowDownRight className="w-3 h-3"/>入庫</span>}
                         {log.type === 'out' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold"><ArrowUpRight className="w-3 h-3"/>出庫</span>}
                         {log.type === 'set' && <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold"><ClipboardCheck className="w-3 h-3"/>棚卸</span>}
                         {log.type === 'register' && <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold"><Plus className="w-3 h-3"/>新規</span>}
                         {log.type === 'delete' && <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold"><Trash2 className="w-3 h-3"/>削除</span>}
                         {log.type === 'edit' && <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold"><Edit className="w-3 h-3"/>修正</span>}
                         {log.type === 'mail' && <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs font-bold"><Send className="w-3 h-3"/>発注依頼</span>}
                       </td>
                       <td className="px-4 py-2 font-medium text-slate-700">{log.partNumber}</td>
                       <td className="px-4 py-2 text-right">{log.diff !== 0 ? (log.diff > 0 ? `+${log.diff}` : log.diff) : '-'}</td>
                       <td className="px-4 py-2 text-right font-bold text-slate-600">{log.type === 'delete' ? '-' : log.stockAfter}</td>
                     </tr>
                   ))}
                   {filteredLogs.length === 0 && (
                      <tr><td colSpan="6" className="p-4 text-center text-slate-400 text-xs">履歴はありません</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Side Column: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 transition-all duration-300 ${!currentUser ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            
            {!currentUser && (
              <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center"><Lock className="w-12 h-12 text-slate-400 mb-2" /><h3 className="font-bold text-slate-700 mb-1">閲覧モード</h3><p className="text-sm text-slate-500 mb-4">操作にはログインが必要です</p><button onClick={() => setShowLoginModal(true)} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-lg">ログイン</button></div>
            )}

            <div className={`px-4 py-3 border-b border-slate-200 flex justify-between items-center ${formMode === 'edit' ? 'bg-blue-50' : 'bg-slate-100'}`}>
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                {formMode === 'register' && <><Plus className="w-4 h-4" /> 新規登録</>}
                {formMode === 'edit' && <><Edit className="w-4 h-4" /> 情報の編集</>}
              </h2>
              <button onClick={handleClear} className="text-xs text-slate-500 hover:text-slate-700 underline" disabled={!currentUser}>クリア(新規へ)</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4" inert={!currentUser ? "" : undefined}>
              
              {/* カタログ選択 (新規時のみ) */}
              {formMode === 'register' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setIsCatalogOpen(!isCatalogOpen)} className="w-full px-3 py-2 flex justify-between items-center bg-indigo-100 text-indigo-900 text-xs font-bold hover:bg-indigo-200 transition-colors"><span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> メーカーカタログから検索・入力</span>{isCatalogOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                  {isCatalogOpen && (
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] text-indigo-600 font-bold">カタログスペック絞り込み</div>
                        <div className="flex gap-2">
                          <button type="button" onClick={handleResetCatalogFilters} className="text-[10px] bg-white text-slate-500 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> リセット</button>
                          <button type="button" onClick={() => setShowCatalogModal(true)} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center gap-1"><CloudDownload className="w-3 h-3" /> データ管理</button>
                        </div>
                      </div>
                      
                      {/* 品番検索 (Web Search含む) */}
                      <div className="flex gap-2 items-center">
                         <div className="relative flex-1">
                           <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                           <input type="text" placeholder="品番でカタログ検索..." value={catalogSearchQuery} onChange={(e) => setCatalogSearchQuery(e.target.value)} className="w-full pl-7 pr-2 py-1 text-xs border border-indigo-200 rounded focus:outline-none focus:border-indigo-500" />
                         </div>
                         <button type="button" onClick={() => handleGoogleSearch(catalogSearchQuery)} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1.5 rounded hover:bg-slate-200 border border-slate-200 flex items-center gap-1 whitespace-nowrap" title="Googleで検索"><ExternalLink className="w-3 h-3" /> Web検索</button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[{ key: 'manufacturer', label: 'メーカー' }, { key: 'series', label: 'シリーズ' }, { key: 'shape', label: '形状' }, { key: 'flutes', label: '刃数' }, { key: 'diameter', label: '工具径(D)' }, { key: 'radius', label: 'R寸法' }, { key: 'effectiveLength', label: '有効長' }, { key: 'fluteLength', label: '刃長' }].map(field => (
                          <div key={field.key}><select value={catalogFilters[field.key]} onChange={(e) => handleCatalogFilterChange(field.key, e.target.value)} className={`w-full p-1.5 border rounded ${catalogFilters[field.key] ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'border-slate-300 text-slate-600'}`}><option value="">{field.label}</option>{getOptions(catalogItems, catalogFilters, field.key).map(val => (<option key={val} value={val}>{val}</option>))}</select></div>
                        ))}
                      </div>
                      {filteredCatalogItems.length > 0 && (<div className="mt-2 border border-indigo-200 rounded bg-white max-h-32 overflow-y-auto">{filteredCatalogItems.map(item => (<div key={item.id} onClick={() => handleApplyCatalogItem(item)} className="p-2 border-b border-indigo-50 hover:bg-indigo-50 cursor-pointer transition-colors group"><div className="flex justify-between items-start"><div className="font-bold text-xs text-slate-700 group-hover:text-indigo-700">{item.partNumber}</div><div className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded">{item.manufacturer}</div></div><div className="text-[10px] text-slate-500 mt-0.5">{item.shape} φ{item.diameter} {item.radius > 0 ? `R${item.radius}` : ''} L{item.fluteLength}</div></div>))}</div>)}
                    </div>
                  )}
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">基本情報</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">品番 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                       <input required type="text" name="partNumber" value={formData.partNumber} onChange={handleInputChange} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg" placeholder="例: MSE430" disabled={!currentUser} />
                       {/* フォーム入力中の品番でWeb検索するボタン */}
                       <button type="button" onClick={() => handleGoogleSearch(formData.partNumber)} disabled={!currentUser || !formData.partNumber} className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 border border-slate-200 flex items-center gap-1 transition-colors disabled:opacity-50" title="Googleで検索"><ExternalLink className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">メーカー</label>
                      <input 
                        list="manufacturer-options"
                        type="text" 
                        name="manufacturer" 
                        value={formData.manufacturer} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                        placeholder="入力または選択" 
                        disabled={!currentUser} 
                      />
                      <datalist id="manufacturer-options">
                        {dynamicManufacturerOptions.map(opt => <option key={opt} value={opt} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">シリーズ</label>
                      <input 
                        list="series-options"
                        type="text" 
                        name="series" 
                        value={formData.series} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                        placeholder="入力または選択"
                        disabled={!currentUser} 
                      />
                      <datalist id="series-options">
                        {dynamicSeriesOptions.map(opt => <option key={opt} value={opt} />)}
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">寸法・形状</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">形状</label>
                    <input 
                      list="shape-options" 
                      type="text" 
                      name="shape" 
                      value={formData.shape} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                      disabled={!currentUser} 
                      placeholder="選択または入力"
                    />
                    <datalist id="shape-options">
                      {dynamicShapeOptions.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">材質</label>
                    <div className="relative">
                      <input 
                        list="material-options" 
                        type="text" 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                        disabled={!currentUser} 
                        placeholder="選択または入力"
                      />
                      <datalist id="material-options">
                        {dynamicMaterialOptions.map(opt => <option key={opt} value={opt} />)}
                      </datalist>
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">刃数</label><input type="number" name="flutes" value={formData.flutes} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="枚" disabled={!currentUser} /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">工具径(D)</label><input type="number" step="0.01" name="diameter" value={formData.diameter} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="mm" disabled={!currentUser} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">R寸法</label><input type="number" step="0.01" name="radius" value={formData.radius} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="mm" disabled={!currentUser} /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">有効長(L1)</label><input type="number" step="0.1" name="effectiveLength" value={formData.effectiveLength} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="mm" disabled={!currentUser} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">刃長(L)</label><input type="number" step="0.1" name="fluteLength" value={formData.fluteLength} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="mm" disabled={!currentUser} /></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">タイプ(長さ)</label>
                    <div className="relative">
                      <input 
                        list="length-type-options" 
                        type="text" 
                        name="lengthType" 
                        value={formData.lengthType || ''} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                        disabled={!currentUser} 
                        placeholder="選択または入力"
                      />
                      <datalist id="length-type-options">
                        {dynamicLengthTypeOptions.map(opt => <option key={opt} value={opt} />)}
                      </datalist>
                      <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                {/* 用途 (Full Width) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">用途</label>
                  <div className="relative">
                    <input type="text" name="usage" value={formData.usage} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg pl-9" placeholder="例: 側面仕上げ、荒加工など" disabled={!currentUser} />
                    <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
              <hr className="border-slate-100" />
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">在庫管理</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-sm font-bold text-blue-800 mb-1">現在在庫</label>
                    <input 
                      required type="number" name="stock" value={formData.stock} onChange={handleInputChange} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formMode === 'edit' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white border-blue-200'}`} 
                      placeholder="個数" 
                      disabled={formMode === 'edit' || !currentUser} 
                    />
                    {formMode === 'edit' && (
                      <div className="absolute right-2 top-8 text-slate-400"><Lock className="w-4 h-4"/></div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-800 mb-1">発注点</label>
                    <input required type="number" name="reorderPoint" value={formData.reorderPoint} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white" placeholder="閾値" disabled={!currentUser} />
                  </div>
                </div>
                {formMode === 'edit' && (
                  <p className="text-[10px] text-slate-500 text-right">※在庫数の変更はリストの「入出庫ボタン」から行ってください</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={!currentUser || (formMode === 'edit' && !isFormChanged)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95 ${
                    (!currentUser || (formMode === 'edit' && !isFormChanged)) 
                      ? 'bg-slate-400 cursor-not-allowed transform-none shadow-none' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {formMode === 'edit' ? <><Save className="w-5 h-5"/> 情報を更新する</> : <><Plus className="w-5 h-5"/> 新規登録する</>}
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>

      {showToast && <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce-in z-50"><CheckCircle className="w-5 h-5 text-green-400" /><span>{toastMessage}</span></div>}
      <style>{`@keyframes bounce-in { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } } .animate-bounce-in { animation: bounce-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); } .animate-fade-in { animation: fade-in 0.3s ease-out; }`}</style>
    </div>
  );
}