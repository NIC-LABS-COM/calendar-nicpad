sap.ui.define(
  [
    './BaseController',
    'sap/ui/Device',
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/Fragment',
    'sap/ui/core/Item',
    'sap/m/MessageToast',
    'model/formatter',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core',
    'sap/m/Label',
    'sap/m/Popover',
    'sap/ui/core/library',
    'sap/ui/core/format/DateFormat',
    'sap/base/Log'
  ],
  function (
    BaseController,
    Device,
    Controller,
    Fragment,
    Item,
    MessageToast,
    formatter,
    JSONModel,
    oCore,
    Label,
    Popover,
    coreLibrary,
    DateFormat,
    Log
  ) {
    'use strict'

    var ValueState = coreLibrary.ValueState

    return BaseController.extend('teamCalendar.controller.Main', {
      myformatter: formatter,
      imagePath: sap.ui.require
        .toUrl('sap/m/demokit/teamCalendar/webapp/')
        .replace('/resources/', '/test-resources/'),

      // Initial setup
      onInit: function () {
        this._oStartDate = new Date()
        // this._oModel = this.getView().getModel('calendar')
        // this._sSelectedView = this._oModel.getProperty('/viewKey')
        this._sSelectedView = 'Day'
        this._sSelectedMember = 'Funcionarios'
        this._oCalendarContainer = this.byId('mainContent')
        this._mCalendars = {}
        this._sCalendarDisplayed = ''

        // Carregar e exibir o calendário de planejamento
        this._loadCalendar('PlanningCalendar')

        this._getFuncionariosList()
        this._getTarefasList()
        this._getTipoList()
        this._getCargoList()
        this._getPrioridadeList()
        // var oModel = this.getView().getModel('funcionariosModel')
        // console.log(oModel.getData())
      },

      // Faz o carregamento do PlanningCalendar/SinglePlanningCalendar dependendo do item selecionado
      selectChangeHandler: function (oEvent) {
        this._sSelectedMember = oEvent.getParameter('selectedItem').getKey()
        this._loadCalendar(
          isNaN(this._sSelectedMember)
            ? 'PlanningCalendar'
            : 'SinglePlanningCalendar'
        )
      },

      // Carrega SinglePlanningCalendar para uma pessoa cuja linha é clicada
      rowSelectionHandler: function (oEvent) {
        var oSelectedRow = oEvent.getParameter('rows')[0],
          sSelectedId = oSelectedRow.getId()
        // sSelectedId = oSelectedRow
        //   .getBindingContext('funcionariosModel')
        //   .getProperty('funcionarioId')

        this._sSelectedMember = sSelectedId.substr(
          sSelectedId.lastIndexOf('-') + 1
        )
        oSelectedRow.setSelected(false)
        this._loadCalendar('SinglePlanningCalendar')
      },

      // Salva a data atualmente selecionada. Responsável por atualizar a data de início (start date) quando o usuário seleciona uma nova data em uma fonte de eventos.
      startDateChangeHandler: function (oEvent) {
        this._oStartDate = new Date(oEvent.getSource().getStartDate())
      },

      // Salva a exibição atualmente selecionada. Atualiza a exibição do calendário quando o usuário altera a visualização do calendário em uma fonte de eventos e atualizar a data de início do calendário em conformidade.

      viewChangeHandler: function (oEvent) {
        var oCalendar = oEvent.getSource()
        if (isNaN(this._sSelectedMember)) {
          this._sSelectedView = oCalendar.getViewKey()
        } else {
          this._sSelectedView = oCore.byId(oCalendar.getSelectedView()).getKey()
        }
        oCalendar.setStartDate(this._oStartDate)
      },

      _aDialogTypes: [
        { title: 'Criar tarefa', type: 'create_appointment' },
        { title: 'Novo funcionário', type: 'create_employee' },
        { title: 'Editar tarefa', type: 'edit_appointment' }
      ],

      // Responsável por lidar com a seleção de compromissos em um calendário, determinando se um único compromisso ou um grupo de compromissos foi selecionado e lidando com a seleção de acordo, chamando as funções "_handleSingleAppointment()" ou "_handleGroupAppointments()" conforme apropriado.
      handleAppointmentSelect: function (oEvent) {
        var oAppointment = oEvent.getParameter('appointment')

        if (oAppointment) {
          this._handleSingleAppointment(oAppointment)
        } else {
          this._handleGroupAppointments(oEvent)
        }
      },

      _addNewAppointment: function (oAppointment) {
        var oModel = this.getView().getModel(),
          sPath =
            '/people/' +
            this.byId('selectPerson').getSelectedIndex().toString(),
          oPersonAppointments

        if (this.byId('isIntervalAppointment').getSelected()) {
          sPath += '/headers'
        } else {
          sPath += '/appointments'
        }

        oPersonAppointments = oModel.getProperty(sPath)

        oPersonAppointments.push(oAppointment)

        oModel.setProperty(sPath, oPersonAppointments)
      },
      handleCancelButton: function () {
        this.byId('detailsPopover').close()
      },

      // Manipulador do botão "Criar novo compromisso" (oEvent)
      taskCreate: function () {
        this._arrangeDialogFragment(this._aDialogTypes[0].type)
      },

      // Manipulador do botão "Novo Funcionário" (oEvent)
      employeeCreate: function () {
        this._arrangeDialogFragment(this._aDialogTypes[1].type)
      },

      // Opend a legend
      openLegend: function (oEvent) {
        var oSource = oEvent.getSource(),
          oView = this.getView()
        if (!this._pLegendPopover) {
          this._pLegendPopover = Fragment.load({
            id: oView.getId(),
            name: 'teamCalendar.view.Legend',
            controller: this
          }).then(function (oLegendPopover) {
            oView.addDependent(oLegendPopover)
            return oLegendPopover
          })
        }
        this._pLegendPopover.then(function (oLegendPopover) {
          if (oLegendPopover.isOpen()) {
            oLegendPopover.close()
          } else {
            oLegendPopover.openBy(oSource)
          }
        })
      },

      // handleAppointmentAddWithContext: function (oEvent) {
      //   this.oClickEventParameters = oEvent.getParameters()
      //   this._arrangeDialogFragment(this._aDialogTypes[3].type)
      // },

      _validateDateTimePicker: function (
        oDateTimePickerStart,
        oDateTimePickerEnd
      ) {
        var oStartDate = oDateTimePickerStart.getDateValue(),
          oEndDate = oDateTimePickerEnd.getDateValue(),
          sValueStateText =
            'A data de início deve ser anterior à data de término'

        if (
          oStartDate &&
          oEndDate &&
          oEndDate.getTime() <= oStartDate.getTime()
        ) {
          oDateTimePickerStart.setValueState(ValueState.Error)
          oDateTimePickerEnd.setValueState(ValueState.Error)
          oDateTimePickerStart.setValueStateText(sValueStateText)
          oDateTimePickerEnd.setValueStateText(sValueStateText)
        } else {
          oDateTimePickerStart.setValueState(ValueState.None)
          oDateTimePickerEnd.setValueState(ValueState.None)
        }
      },

      updateButtonEnabledState: function (oDialog) {
        var oStartDate = this.byId('startDate'),
          oEndDate = this.byId('endDate'),
          bEnabled =
            oStartDate.getValueState() !== ValueState.Error &&
            oStartDate.getValue() !== '' &&
            oEndDate.getValueState() !== ValueState.Error
        oEndDate.getValue() !== '' &&
          oDialog.getBeginButton().setEnabled(bEnabled)
      },

      eUpdateButtonEnabledState: function (oDialog) {
        var oStartDate = this.byId('eStartDate'),
          oEndDate = this.byId('eEndDate'),
          bEnabled =
            oStartDate.getValueState() !== ValueState.Error &&
            oStartDate.getValue() !== '' &&
            oEndDate.getValueState() !== ValueState.Error
        oEndDate.getValue() !== '' &&
          oDialog.getBeginButton().setEnabled(bEnabled)
      },

      handleCreateChange: function (oEvent) {
        var oDateTimePickerStart = this.byId('startDate'),
          oDateTimePickerEnd = this.byId('endDate')

        if (oEvent.getParameter('valid')) {
          this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd)
        } else {
          oEvent.getSource().setValueState(ValueState.Error)
        }

        this.updateButtonEnabledState(this.byId('createTask'))
      },

      eHandleCreateChange: function (oEvent) {
        var oDateTimePickerStart = this.byId('eStartDate'),
          oDateTimePickerEnd = this.byId('eEndDate')

        if (oEvent.getParameter('valid')) {
          this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd)
        } else {
          oEvent.getSource().setValueState(ValueState.Error)
        }

        this.eUpdateButtonEnabledState(this.byId('editTask'))
      },

      // _removeAppointment: function (oAppointment, sPersonId) {
      //   var oModel = this.getView().getModel(),
      //     sTempPath,
      //     aPersonAppointments,
      //     iIndexForRemoval

      //   if (!sPersonId) {
      //     sTempPath = this.sPath.slice(
      //       0,
      //       this.sPath.indexOf('appointments/') + 'appointments/'.length
      //     )
      //   } else {
      //     sTempPath = '/people/' + sPersonId + '/appointments'
      //   }

      //   aPersonAppointments = oModel.getProperty(sTempPath)
      //   iIndexForRemoval = aPersonAppointments.indexOf(oAppointment)

      //   if (iIndexForRemoval !== -1) {
      //     aPersonAppointments.splice(iIndexForRemoval, 1)
      //   }

      //   oModel.setProperty(sTempPath, aPersonAppointments)
      // },

      taskDelete: function (oEvent) {
        var oButton = oEvent.getSource(),
          oDetailsPopover = oButton.getParent().getParent().getParent(),
          oBindingContext =
            oDetailsPopover.getBindingContext('funcionariosModel'),
          oAppointment = oBindingContext.getObject(),
          tarefaId = oAppointment.tarefaId,
          that = this

        if (tarefaId) {
          this._deleteTarefa(tarefaId)
        }

        // Feche o ResponsivePopover
        oDetailsPopover.close()
      },

      employeeDelete: function (oEvent) {
        var oButton = oEvent.getSource(),
          oDetailsPopover = oButton.getParent(),
          oBindingContext =
            oDetailsPopover.getBindingContext('funcionariosModel'),
          oAppointment = oBindingContext.getObject(),
          funcionarioId = oAppointment.funcionarioId,
          that = this

        if (funcionarioId) {
          this._deleteFuncionarioTarefa(funcionarioId, function () {
            // A função de retorno será chamada após a exclusão das tarefas associadas ao funcionário
            that._deleteFuncionario(funcionarioId)
          })
        }

        // Feche o ResponsivePopover
        oDetailsPopover.close()
      },

      taskEdit: function () {
        var oDetailsPopover = this.byId('detailsPopover')
        this.sPath = oDetailsPopover
          .getBindingContext('funcionariosModel')
          .getPath()
        oDetailsPopover.close()
        this._arrangeDialogFragment(this._aDialogTypes[2].type)
      },

      _arrangeDialogFragment: function (sDialogType) {
        var oView = this.getView()
        var sDialogName = ''

        if (sDialogType === 'create_appointment') {
          sDialogName = 'teamCalendar.view.Create'
        } else if (sDialogType === 'edit_appointment') {
          sDialogName = 'teamCalendar.view.Edit'
        } else if (sDialogType === 'create_employee') {
          sDialogName = 'teamCalendar.view.New'
        }

        if (!this['_p' + sDialogType + 'Dialog']) {
          this['_p' + sDialogType + 'Dialog'] = Fragment.load({
            id: oView.getId(),
            name: sDialogName,
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            return oDialog
          })
        }

        this['_p' + sDialogType + 'Dialog'].then(
          function (oDialog) {
            this._arrangeDialog(sDialogType, oDialog)
          }.bind(this)
        )
      },

      _arrangeDialog: function (sDialogType, oDialog) {
        var sTempTitle = ''
        oDialog._sDialogType = sDialogType
        if (sDialogType === 'edit_appointment') {
          this._setEditAppointmentDialogContent(oDialog)
          sTempTitle = this._aDialogTypes[2].title
        } else if (sDialogType === 'create_employee') {
          sTempTitle = this._aDialogTypes[1].title
        } else if (sDialogType === 'create_appointment') {
          this._setCreateAppointmentDialogContent()
          sTempTitle = this._aDialogTypes[0].title
        } else {
          Log.error('Tipo de diálogo incorreto..')
        }

        // this.updateButtonEnabledState(this.byId(oDialog))
        oDialog.setTitle(sTempTitle)
        oDialog.open()
      },

      _editAppointment: function (
        oAppointment,
        bIsIntervalAppointment,
        iPersonId,
        oNewAppointmentDialog
      ) {
        var sAppointmentPath = this._appointmentOwnerChange(
            oNewAppointmentDialog
          ),
          oModel = this.getView().getModel('funcionariosModel')

        if (bIsIntervalAppointment) {
          this._convertToHeader(oAppointment, oNewAppointmentDialog)
        } else {
          if (this.sPath !== sAppointmentPath) {
            this._addNewAppointment(
              oNewAppointmentDialog
                .getModel('funcionariosModel')
                .getProperty(this.sPath)
            )
            this._removeAppointment(
              oNewAppointmentDialog
                .getModel('funcionariosModel')
                .getProperty(this.sPath)
            )
          }
          oModel.setProperty(sAppointmentPath + '/title', oAppointment.title)
          oModel.setProperty(sAppointmentPath + '/info', oAppointment.info)
          oModel.setProperty(sAppointmentPath + '/type', oAppointment.type)
          oModel.setProperty(sAppointmentPath + '/start', oAppointment.start)
          oModel.setProperty(sAppointmentPath + '/end', oAppointment.end)
        }
      },

      _convertToHeader: function (oAppointment, oNewAppointmentDialog) {
        var sPersonId = this.byId('selectPerson').getSelectedIndex().toString()

        this._removeAppointment(
          oNewAppointmentDialog
            .getModel('funcionariosModel')
            .getProperty(this.sPath),
          sPersonId
        )
        this._addNewAppointment({
          start: oAppointment.start,
          end: oAppointment.end,
          title: oAppointment.title,
          type: oAppointment.type
        })
      },

      _appointmentOwnerChange: function (oNewAppointmentDialog) {
        var iSpathPersonId =
            this.sPath[
              this.sPath.indexOf('/Funcionarios/') + '/Funcionarios/'.length
            ],
          iSelectedPerson = this.byId('selectPerson').getSelectedIndex(),
          sTempPath = this.sPath,
          iLastElementIndex = oNewAppointmentDialog
            .getModel()
            .getProperty(
              '/Funcionarios/' + iSelectedPerson.toString() + '/Tarefas/'
            )
            .length.toString()

        if (iSpathPersonId !== iSelectedPerson.toString()) {
          sTempPath = sTempPath.replace(
            '/Funcionarios/' + iSpathPersonId + '/',
            '/Funcionarios/' + iSelectedPerson.toString() + '/'
          )
        }

        return sTempPath
      },

      _setEditAppointmentDialogContent: function (oDialog) {
        var oAppointment = oDialog
            .getModel('funcionariosModel')
            .getProperty(this.sPath),
          oSelectedIntervalStart = oAppointment.start,
          oSelectedIntervalEnd = oAppointment.end,
          oDateTimePickerStart = this.byId('eStartDate'),
          oDateTimePickerEnd = this.byId('eEndDate'),
          sSelectedInfo = oAppointment.info,
          sSelectedTitle = oAppointment.title,
          sSelectedTipo = oAppointment.tipoId - 1,
          sSelectedAprov = oAppointment.aprovadorId - 1,
          sSelectedPart = oAppointment.participanteId - 1,
          iSelectedPersonId =
            this.sPath[
              this.sPath.indexOf('/Funcionarios/') + '/Funcionarios/'.length
            ],
          oTipoSelected = this.byId('eTipoId'),
          oAprovSelected = this.byId('eAprovadorId'),
          oPartSelected = this.byId('eParticipanteId'),
          oPersonSelected = this.byId('eFuncionarioId'),
          oStartDate = this.byId('eStartDate'),
          oEndDate = this.byId('eEndDate'),
          oMoreInfoInput = this.byId('eMoreInfo'),
          oTitleInput = this.byId('eInputTitle')
        oPersonSelected.setSelectedIndex(iSelectedPersonId)
        oTipoSelected.setSelectedIndex(sSelectedTipo)
        oAprovSelected.setSelectedIndex(sSelectedAprov)
        oPartSelected.setSelectedIndex(sSelectedPart)
        oStartDate.setDateValue(this.formatDate(oSelectedIntervalStart))
        oEndDate.setDateValue(this.formatDate(oSelectedIntervalEnd))
        oMoreInfoInput.setValue(sSelectedInfo)
        oTitleInput.setValue(sSelectedTitle)
        oDateTimePickerStart.setValueState(ValueState.None)
        oDateTimePickerEnd.setValueState(ValueState.None)
      },

      _setCreateAppointmentDialogContent: function () {
        var oAppointment = {},
          oSelectedIntervalStart = null,
          oSelectedIntervalEnd = null,
          oDateTimePickerStart = this.byId('startDate'),
          oDateTimePickerEnd = this.byId('endDate'),
          // sSelectedInfo = '',
          // sSelectedTitle = '',
          // sSelectedTipo = '',
          // sSelectedAprov = '',
          // sSelectedPart = '',
          // iSelectedPersonId = '',
          oTipoSelected = this.byId('tipoId'),
          oAprovSelected = this.byId('aprovadorId'),
          oPartSelected = this.byId('participanteId'),
          oPersonSelected = this.byId('funcionarioId'),
          oStartDate = this.byId('startDate'),
          oEndDate = this.byId('endDate'),
          oMoreInfoInput = this.byId('moreInfo'),
          oTitleInput = this.byId('inputTitle')

        oPersonSelected.setSelectedIndex()
        oTipoSelected.setSelectedIndex()
        oAprovSelected.setSelectedIndex()
        oPartSelected.setSelectedIndex()
        oStartDate.setDateValue(null)
        oEndDate.setDateValue(null)
        oMoreInfoInput.setValue('')
        oTitleInput.setValue('')
        oDateTimePickerStart.setValueState(ValueState.None)
        oDateTimePickerEnd.setValueState(ValueState.None)
      },

      _handleSingleAppointment: function (oAppointment) {
        var oView = this.getView()
        if (oAppointment === undefined) {
          return
        }

        if (!oAppointment.getSelected() && this._pDetailsPopover) {
          this._pDetailsPopover.then(function (oDetailsPopover) {
            oDetailsPopover.close()
          })
          return
        }

        if (!this._pDetailsPopover) {
          this._pDetailsPopover = Fragment.load({
            id: oView.getId(),
            name: 'teamCalendar.view.Details',
            controller: this
          }).then(function (oDetailsPopover) {
            oView.addDependent(oDetailsPopover)
            return oDetailsPopover
          })
        }

        this._pDetailsPopover.then(
          function (oDetailsPopover) {
            this._setDetailsDialogContent(oAppointment, oDetailsPopover)
          }.bind(this)
        )
      },

      _setDetailsDialogContent: function (oAppointment, oDetailsPopover) {
        var oContext = oAppointment.getBindingContext('funcionariosModel')
        oDetailsPopover.setBindingContext(oContext, 'funcionariosModel')
        oDetailsPopover.openBy(oAppointment)
      },

      formatDate: function (sDate) {
        return new Date(sDate)
      },

      // _handleGroupAppointments: function (oEvent) {
      //   var aAppointments,
      //     sGroupAppointmentType,
      //     sGroupPopoverValue,
      //     sGroupAppDomRefId,
      //     bTypeDiffer

      //   aAppointments = oEvent.getParameter('appointments')
      //   sGroupAppointmentType = aAppointments[0].getType()
      //   sGroupAppDomRefId = oEvent.getParameter('domRefId')
      //   bTypeDiffer = aAppointments.some(function (oAppointment) {
      //     return sGroupAppointmentType !== oAppointment.getType()
      //   })

      //   if (bTypeDiffer) {
      //     sGroupPopoverValue =
      //       aAppointments.length + ' Appointments of different types selected'
      //   } else {
      //     sGroupPopoverValue =
      //       aAppointments.length +
      //       ' Appointments of the same ' +
      //       sGroupAppointmentType +
      //       ' selected'
      //   }

      //   if (!this._oGroupPopover) {
      //     this._oGroupPopover = new Popover({
      //       title: 'Group Appointments',
      //       content: new Label({
      //         text: sGroupPopoverValue
      //       })
      //     })
      //   } else {
      //     this._oGroupPopover.getContent()[0].setText(sGroupPopoverValue)
      //   }
      //   this._oGroupPopover.addStyleClass('sapUiContentPadding')
      //   this._oGroupPopover.openBy(document.getElementById(sGroupAppDomRefId))
      // },

      // Loads and displays calendar (if not already loaded), otherwise just displays it
      _loadCalendar: function (sCalendarId) {
        var oView = this.getView()

        if (!this._mCalendars[sCalendarId]) {
          this._mCalendars[sCalendarId] = Fragment.load({
            id: oView.getId(),
            name: 'teamCalendar.view.' + sCalendarId,
            controller: this
          }).then(
            function (oCalendarVBox) {
              this._populateSelect(this.byId(sCalendarId + 'TeamSelector'))
              return oCalendarVBox
            }.bind(this)
          )
        }

        this._mCalendars[sCalendarId].then(
          function (oCalendarVBox) {
            this._displayCalendar(sCalendarId, oCalendarVBox)
          }.bind(this)
        )
      },

      _hideCalendar: function () {
        if (this._sCalendarDisplayed === '') {
          return Promise.resolve()
        }
        return this._mCalendars[this._sCalendarDisplayed].then(
          function (oOldCalendarVBox) {
            this._oCalendarContainer.removeContent(oOldCalendarVBox)
          }.bind(this)
        )
      },

      // Displays already loaded calendar

      _displayCalendar: function (sCalendarId, oCalendarVBox) {
        this._hideCalendar().then(
          function () {
            this._oCalendarContainer.addContent(oCalendarVBox)
            this._sCalendarDisplayed = sCalendarId
            var oCalendar = oCalendarVBox.getItems()[0]
            var oTeamSelect = this.byId(sCalendarId + 'TeamSelector')
            oTeamSelect.setSelectedKey(this._sSelectedMember)
            oCalendar.setStartDate(this._oStartDate)
            if (isNaN(this._sSelectedMember)) {
              // Planning Calendar
              oCalendar.setViewKey(this._sSelectedView)
              oCalendar.bindElement({
                path: '/Funcionarios',
                model: 'funcionariosModel'
              })
            } else {
              // Single Planning Calendar
              oCalendar.setSelectedView(
                oCalendar.getViewByKey(this._sSelectedView)
              )
              //var sId = this._sSelectedMember
              oCalendar.bindElement({
                path: '/Funcionarios/' + this._sSelectedMember,
                model: 'funcionariosModel'
              })
            }
          }.bind(this)
        )
      },

      // MINHAS MODIFICAÇÕES

      onSave: function (oEvent) {
        var tarefasModel = this.getView().getModel('tarefasModel'),
          aTarefas = tarefasModel.getData(),
          that = this
        if (!aTarefas.tarefaId) {
          this._createTarefas(aTarefas)
        }
        this.byId('createTask').close()
      },

      onEdit: function (oEvent) {
        var tarefasModel = this.getView().getModel('tarefasModel'),
          funcionariosModel = this.getView().getModel('funcionariosModel'),
          aTarefas = tarefasModel.getData(),
          sTarefaPath = this.sPath.split('/')[this.sPath.split('/').length - 1],
          sPathParts = this.sPath.split('/'),
          sFuncionarioPath = sPathParts[Math.floor(sPathParts.length / 2)],
          oTarefa = funcionariosModel.getProperty(
            '/Funcionarios/' + sFuncionarioPath + '/Tarefas/' + sTarefaPath
          ),
          tarefaId = oTarefa.tarefaId,
          that = this
        if (aTarefas) {
          this._updateTarefas(aTarefas, tarefaId)
        }
        this.byId('editTask').close()
      },

      onSaveFuncionario: function (oEvent) {
        var funcionariosModel = this.getView().getModel('funcionariosModel'),
          aFuncionarios = funcionariosModel.getData(),
          that = this
        if (!aFuncionarios._id) {
          this._createFuncionarios(aFuncionarios)
          this.byId('createEmployee').close()
        }
      },

      onCancelEmployee: function () {
        this.byId('createEmployee').close()
      },
      onCancelTask: function () {
        this.byId('createTask').close()
      },

      onCancelEdit: function () {
        this.byId('editTask').close()
      },

      _createTarefas: function (aTarefas) {
        var that = this
        jQuery.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: '/createTarefa',
          data: JSON.stringify(aTarefas),
          dataType: 'json',
          async: false,
          success: function (data, textStatus, jqXHR) {
            // Atualiza o modelo após a inserção
            that.getView().getModel('tarefasModel').setData(data)
            MessageToast.show('Tarefa criada com sucesso.')
            location.reload()
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Erro ao criar tarefa: ', textStatus, errorThrown)
          }
        })
      },

      _deleteFuncionario: function (funcionarioId) {
        var that = this
        $.ajax({
          url: '/deleteFuncionario/' + funcionarioId,
          type: 'POST',
          success: function (response) {
            // Exibimos uma mensagem de sucesso caso a tarefa seja excluída com sucesso
            sap.m.MessageToast.show(response.msg)
            location.reload()
          },
          error: function () {
            // Exibimos uma mensagem de erro caso ocorra algum problema ao excluir a tarefa
            sap.m.MessageToast.show('Erro ao deletar funcionario.')
          }
        })

        oDetailsPopover.close()
      },

      _deleteFuncionarioTarefa: function (funcionarioId, callback) {
        var that = this

        $.ajax({
          url: '/deleteEmployeeTask/' + funcionarioId + '/tarefas',
          type: 'DELETE',
          success: function (response) {
            // Exibimos uma mensagem de sucesso caso a tarefa seja excluída com sucesso
            sap.m.MessageToast.show(response.msg)

            if (callback && typeof callback === 'function') {
              // Se a função de retorno for fornecida, chamamos a função após a exclusão das tarefas
              callback()
            }
          },
          error: function () {
            // Exibimos uma mensagem de erro caso ocorra algum problema ao excluir a tarefa
            sap.m.MessageToast.show('Erro ao deletar tarefas.')
          }
        })
      },

      _deleteTarefa: function (tarefaId) {
        var that = this
        $.ajax({
          url: '/deleteTarefa/' + tarefaId,
          type: 'POST',
          success: function (response) {
            // Exibimos uma mensagem de sucesso caso a tarefa seja excluída com sucesso
            sap.m.MessageToast.show(response.msg)
            location.reload()
          },
          error: function () {
            // Exibimos uma mensagem de erro caso ocorra algum problema ao excluir a tarefa
            sap.m.MessageToast.show('Erro ao deletar Tarefa.')
          }
        })

        oDetailsPopover.close()
      },

      _updateTarefas: function (aTarefas, tarefaId) {
        var that = this
        jQuery.ajax({
          type: 'PUT',
          url: '/updateTarefa/' + tarefaId,
          dataType: 'json',
          data: aTarefas,
          async: false,
          success: function (data, textStatus, jqXHR) {
            that.getView().getModel('tarefasModel').setData(data)
            MessageToast.show('Tarefa atualizada com sucesso.')
            location.reload()
            console.log(textStatus, jqXHR)
          },
          error: function (jqXHR, textStatus, errorThrown) {
            MessageToast.show('Erro ao atualizar tarefa.')
            console.log(errorThrown, textStatus)
            console.error('Erro ao atualizar tarefa: ', textStatus, errorThrown)
          }
        })
      },

      _getTipoList: function () {
        var url = '/listTipo'
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oTipoModel = new sap.ui.model.json.JSONModel()
            oTipoModel.setData({
              Tipos: data
            })
            that.getView().setModel(oTipoModel, 'tipoModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados Tipo recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },

      _getCargoList: function () {
        var url = '/listCargo'
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oCargoModel = new sap.ui.model.json.JSONModel()
            oCargoModel.setData({
              Cargos: data
            })
            that.getView().setModel(oCargoModel, 'cargoModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados Cargo recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },

      _getPrioridadeList: function () {
        var url = '/listPrioridade'
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oPrioridadeModel = new sap.ui.model.json.JSONModel()
            oPrioridadeModel.setData({
              Prioridades: data
            })
            that.getView().setModel(oPrioridadeModel, 'prioridadeModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados Prioridade recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },

      _getTarefasList: function () {
        var url = '/listTarefas'
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oTarefasModel = new sap.ui.model.json.JSONModel()
            oTarefasModel.setData({
              Tarefas: data
            })
            that.getView().setModel(oTarefasModel, 'tarefasModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },
      _getOneTask: function (tarefaId) {
        var url = '/getOneTask/' + tarefaId
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oTarefaModel = new sap.ui.model.json.JSONModel()
            oTarefaModel.setData({
              Tarefa: data
            })
            that.getView().setModel(oTarefaModel, 'tarefaModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },

      _createFuncionarios: function (aFuncionarios) {
        var that = this
        jQuery.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: '/createFuncionario',
          data: JSON.stringify(aFuncionarios),
          dataType: 'json',
          async: false,
          success: function (data, textStatus, jqXHR) {
            // Atualiza o modelo após a inserção
            that.getView().getModel('funcionariosModel').setData(data)
            MessageToast.show('Funcionario adicionado com sucesso.')
            location.reload()
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Erro ao criar tarefa: ', textStatus, errorThrown)
            MessageToast.show('Erro ao adicionar funcionario.')
          }
        })
      },

      _getFuncionariosList: function () {
        var url = '/listFuncionarios'
        var that = this
        $.ajax({
          type: 'GET',
          url: url,
          async: false,
          success: function (data, status) {
            var oFuncionariosModel = new sap.ui.model.json.JSONModel()
            oFuncionariosModel.setData({
              Funcionarios: data
            })
            that.getView().setModel(oFuncionariosModel, 'funcionariosModel')
          },
          error: function (error) {
            if (error.responseJSON.msg) {
              MessageToast.show(error.responseJSON.msg, { duration: 6000 })
            }
            if (error.status === 401) {
              that.getRouter().navTo('main')
            }
          }
        })
          .done(function () {
            console.log('Dados recuperados com sucesso.')
          })
          .fail(function () {
            console.log('Erro ao recuperar dados.')
          })
      },

      _populateSelect: function (oSelect) {
        var oFuncionariosModel = this.getView().getModel('funcionariosModel')
        var iCount = oFuncionariosModel.getProperty('/Funcionarios').length,
          iPerson
        for (iPerson = 0; iPerson < iCount; iPerson++) {
          oSelect.addItem(
            new Item({
              key: iPerson,
              text:
                oFuncionariosModel.getProperty('/Funcionarios')[iPerson].nome +
                ' - ' +
                oFuncionariosModel.getProperty('/Funcionarios')[iPerson].Cargo
                  .text
            })
          )
        }
      }

      // _populateSelect: function (oSelect) {
      //   var oFuncionariosModel = this.getView().getModel('funcionariosModel')
      //   // Obtém os dados da tabela "funcionarios" do modelo de dados MSSQL
      //   var aTableData = oFuncionariosModel.getProperty('/Funcionarios')

      //   // Loop pelos dados da tabela e adiciona itens ao objeto Select
      //   for (var i = 0; i < aTableData.length; i++) {
      //     oSelect.addItem(
      //       new sap.ui.core.ListItem({
      //         key: aTableData[i].funcionarioId,
      //         text: aTableData[i].nome + ' - ' + aTableData[i].cargo,
      //         icon: 'sap-icon://employee'
      //       })
      //     )
      //   }
      // }

      // handleSelectionChange: function (oEvent) {
      //   var changedItem = oEvent.getParameter('changedItem')
      //   var isSelected = oEvent.getParameter('selected')

      //   var state = 'Selected'
      //   if (!isSelected) {
      //     state = 'Deselected'
      //   }

      //   MessageToast.show(
      //     "Event 'selectionChange': " +
      //       state +
      //       " '" +
      //       changedItem.getText() +
      //       "'",
      //     {
      //       width: 'auto'
      //     }
      //   )
      // },

      // handleSelectionFinish: function (oEvent) {
      //   var selectedItems = oEvent.getParameter('selectedItems')
      //   var messageText = "Event 'selectionFinished': ["

      //   for (var i = 0; i < selectedItems.length; i++) {
      //     messageText += "'" + selectedItems[i].getText() + "'"
      //     if (i != selectedItems.length - 1) {
      //       messageText += ','
      //     }
      //   }

      //   messageText += ']'

      //   MessageToast.show(messageText, {
      //     width: 'auto'
      //   })
      // }
    })
  }
)
