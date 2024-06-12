import { configureStore, createSlice } from '@reduxjs/toolkit';

// Initial state
const noteInitialState = {
  moreSiderbar: '',
  isDisableInput: false,
  codeConfirmInput: [],
  isClearFormInput: false,
  isChangePassword: false,
  reSendEmail: false,
  isUpdateSetting: false,
  permission: '',
  department: '',
  memberName: '',
  dataSearch: [],
  dataSearchValue: [],
  isDataSearch: false,
  isSearchFormExport: false,
  isSearchFormInto: false,
  isSearchFormTransferExport: false,
  isSearchFormIntoProfile: false,
  isSearchFormExportProfile: false,
  isSearchFormHistoryProfile: false,
  indexRow: 0,
  imageProfile: '',
  dateTimeStart: '',
  dateTimeEnd: new Date().toISOString(),
};

// Create slice
const allSlice = createSlice({
  name: 'all',
  initialState: noteInitialState,
  reducers: {
    imageProfile: (state, action) => {
      state.imageProfile = action.payload;
    },
    searchDatetimeStart: (state, action) => {
      state.dateTimeStart = action.payload;
    },
    searchDatetimeEnd: (state, action) => {
      state.dateTimeEnd = action.payload;
    },
    valueIndex: (state, action) => {
      state.indexRow = action.payload;
    },
    isSearchFormTransferExport: (state, action) => {
      state.isSearchFormTransferExport = action.payload;
    },
    isSearchFormInto: (state, action) => {
      state.isSearchFormInto = action.payload;
    },
    isSearchFormExport: (state, action) => {
      state.isSearchFormExport = action.payload;
    },
    isSearchFormIntoProfile: (state, action) => {
      state.isSearchFormIntoProfile = action.payload;
    },
    isSearchFormExportProfile: (state, action) => {
      state.isSearchFormExportProfile = action.payload;
    },
    isSearchFormHistoryProfile: (state, action) => {
      state.isSearchFormHistoryProfile = action.payload;
    },
    dataSearchValue: (state, action) => {
     
      state.dataSearchValue = action.payload;
    },
    isDataSearch: (state, action) => {
      state.isDataSearch = action.payload;
    },
    dataSearch: (state, action) => {
    
      state.dataSearch = action.payload;
      
    },
    departmentStore: (state, action) => {
      state.department = action.payload;
    },
    memberNameStore: (state, action) => {
      state.memberName = action.payload;
    },
    permissionStore: (state, action) => {
      state.permission = action.payload;
    },
    StatusSiderBar: (state, action) => {
      state.moreSiderbar = action.payload;
    },
    isDisableInput: (state, action) => {
      state.isDisableInput = action.payload;
    },
    codeConfirmInput: (state, action) => {
      state.codeConfirmInput = action.payload;
    },
    isClearFormInput: (state, action) => {
      state.isClearFormInput = action.payload;
    },
    isChangePassword: (state, action) => {
      state.isChangePassword = action.payload;
    },
    reSendEmail: (state, action) => {
      state.reSendEmail = action.payload;
    },
    isUpdateSettingStore: (state, action) => {
      state.isUpdateSetting = action.payload;
    },
  },
});

// Export actions
export const {
  imageProfile,
  searchDatetimeStart,
  searchDatetimeEnd,
  valueIndex,
  isSearchFormTransferExport,
  isSearchFormInto,
  isSearchFormExport,
  isSearchFormIntoProfile,
  isSearchFormExportProfile,
  isSearchFormHistoryProfile,
  dataSearchValue,
  isDataSearch,
  dataSearch,
  departmentStore,
  memberNameStore,
  permissionStore,
  StatusSiderBar,
  isDisableInput,
  codeConfirmInput,
  isClearFormInput,
  isChangePassword,
  reSendEmail,
  isUpdateSettingStore,
} = allSlice.actions;

// Create store
const store = configureStore({
  reducer: {
    allReducer: allSlice.reducer,
  },
});

export default store;
