sap.ui.define(
  ['sap/ui/core/UIComponent', 'sap/ui/model/json/JSONModel'],
  function (UIComponent, JSONModel) {
    'use strict'

    return UIComponent.extend('teamCalendar.Component', {
      metadata: {
        manifest: 'json'
      }
    })
  }
)
