sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/UIComponent',
    'sap/m/library',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageItem',
    'sap/m/MessageView',
    'sap/m/Button',
    'sap/m/Bar',
    'sap/m/Dialog',
    'sap/ui/core/IconPool',
    'sap/m/Text',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/routing/History',
    'sap/m/MessageToast'
  ],
  function (
    Controller,
    UIComponent,
    mobileLibrary,
    JSONModel,
    MessageItem,
    MessageView,
    Button,
    Bar,
    Dialog,
    IconPool,
    Text,
    Filter,
    FilterOperator,
    History,
    MessageToast
  ) {
    'use strict'

    var URLHelper = mobileLibrary.URLHelper

    return Controller.extend('teamCalendar.controller.BaseController', {
      getRouter: function () {
        return UIComponent.getRouterFor(this)
      },

      getModel: function (sName) {
        return this.getView().getModel(sName)
      },

      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName)
      },

      getResourceBundle: function () {
        return this.getOwnerComponent().getModel('i18n').getResourceBundle()
      },

      setUserData: function (userData) {
        sap.ui.getCore().userData = userData
      },

      getUserData: function () {
        return sap.ui.getCore().userData
      }
    })
  }
)
