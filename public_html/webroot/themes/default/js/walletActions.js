$(function () {
    (function () {
        const wallet = {
            'address': false,
            'main': {
                'keysPair': {
                    'public': '',
                    'private': ''
                }
            }
        };
        $('#create').on('click', function () {
            wallet.main = iz3BitcoreCrypto.generateWallet();
        });

        $('#save_file').on('click', function () {
            download(
                JSON.stringify({'address': wallet.main.keysPair.public, 'keysPair' : {'public': wallet.main.keysPair.public, 'private': wallet.main.keysPair.private}}),
                'UTC--' + ((new Date()).toISOString()) + '--' + wallet.main.keysPair.public,
                'text/plain'
            );
            $('#continue')
                .prop("disabled", false)
                .removeClass('disabled');
        });

        $('#continue').on('click', function () {
            $('#s_key').val(wallet.main.keysPair.private);
        });

        var selectLoginWayDlg = new BootstrapDialog({
            title: $.i18n.t('login:main.header'),
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_LARGE,
            spinicon: 'fas fa-spinner fa-pulse',
            message: getLoginWayDlgContent(),
            buttons: [{
                id: 'setWaySeleted',
                label: $.i18n.t('login:main.btn_continue'),
                cssClass: 'btn',
                action: function (dialogRef) {
                    dialogRef.enableButtons(false);
                    dialogRef.setClosable(false);
                    var $button = this;
                    $button.spin();
                    let loginWay = dialogRef.getModalContent().find('.wallet-option.selected').data('option-login') || 0;
                    dialogRef.close();
                    switch (loginWay) {
                        case 1:
                            askLoginFileDlg.open();
                            break;
                        case 2:
                            askLoginKeyDlg.open();
                            break;
                        default:
                    }
                }
            }],
            onshow: function (dialogRef) {
                dialogRef.enableButtons(false);
                dialogRef.getModalFooter().css('text-align', 'center')
            },
            onshown: function (dialogRef) {
                $('.wallet-option').on('click', function () {
                    let alreadySelected = false;
                    let modalContent = dialogRef.getModalContent();
                    if ($(this).hasClass('selected')) {
                        alreadySelected = true;
                    }
                    modalContent.find('.wallet-option').removeClass('selected');
                    modalContent.find('.sign-selected').addClass('hidden');
                    if (alreadySelected) {
                        modalContent.find('#setWaySeleted').removeClass('btn-success');
                        dialogRef.enableButtons(false);
                    } else {
                        $(this).addClass('selected');
                        $('.sign-selected', $(this)).removeClass('hidden');

                        modalContent.find('#setWaySeleted').addClass('btn-success');
                        dialogRef.enableButtons(true);
                    }
                });
            },
        });

        if ($('#login').length) {
            selectLoginWayDlg.open();
        }

        function getLoginWayDlgContent() {
            return '' +
                '<div class="container-fluid">' +
                '<div class="row">' +
                '<div class="col-md-12 col-xs-12 wallet-option" data-option-login="1">' +
                '<div class="col-md-2 col-xs-2 text-right">' +
                '<i class="far fa-file-code fa-2x" style="color: #00a65a;"></i>' +
                '</div>' +
                '<div class="col-md-8 col-xs-8" style="margin-top: 5px;">' +
                $.i18n.t('login:main.by_file_text') +
                '</div>' +
                '<div class="col-md-2 col-xs-2 sign-selected hidden" style="margin-top: 7px;">' +
                '<i class="fas fa-check-circle" style="color: #00a65a;"></i>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-12 col-xs-12 wallet-option" data-option-login="2">' +
                '<div class="col-md-2 col-xs-2 text-right">' +
                '<i class="fas fa-key fa-2x" style="color: #00a65a;"></i>' +
                '</div>' +
                '<div class="col-md-8 col-xs-8" style="margin-top: 5px;">' +
                $.i18n.t('login:main.by_key_text') +
                '</div>' +
                '<div class="col-md-2 col-xs-2 sign-selected hidden" style="margin-top: 7px;">' +
                '<i class="fas fa-check-circle" style="color: #00a65a;"></i>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

        function download(content, fileName, contentType) {
            let link = document.createElement("a");
            let file = new Blob([content], {type: contentType});
            link.href = URL.createObjectURL(file);
            link.download = fileName;
            link.click();
        }

        var askLoginFileDlg = new BootstrapDialog({
            title: $.i18n.t('login:by_file.header'),
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: false,
            size: BootstrapDialog.SIZE_LARGE,
            spinicon: 'fas fa-spinner fa-pulse',
            message: getLoginKeyDlgContent(false),
            buttons: [
                {
                    id: 'file-select',
                    label: $.i18n.t('login:by_file.btn_select_file'),
                    cssClass: 'btn btn-info',
                    action: function (dialogRef) {
                        let content = dialogRef.getModalContent();
                        content.find('#message').hide();
                        $('#key-file').click();
                        dialogRef
                            .getButton('login')
                            .removeClass('btn-success')
                            .stopSpin();
                    }
                },
                {
                    id: 'login',
                    label: $.i18n.t('login:by_file.btn_login'),
                    cssClass: 'btn',
                    action: function (dialogRef) {
                    }
                }
            ],
            onshow: function (dialogRef) {
                dialogRef.getButton('login').disable();
                dialogRef.getModalFooter().css('text-align', 'center');
            },

            onshown: function (dialogRef) {
                let content = dialogRef.getModalContent() || false;
                let btn = content.find('#file-select') || false;
                if (btn) {
                    $('#key-file').click();
                }

                (function(cb){
                    function onChange(event) {
                        dialogRef
                            .getButton('file-select')
                            .disable();
                        dialogRef
                            .getButton('login')
                            .addClass('btn-success')
                            .spin();
                        var reader = new FileReader();
                        reader.onload = onReaderLoad;
                        let file = event.target.files[0] || false;
                        if(file){
                            reader.readAsText(file);
                        }
                    }
                    async function onReaderLoad(event){
                        let result = {'msg': '', 'data': ''};
                        try {
                            let obj = await JSON.parse(event.target.result);
                            result.data = obj;
                        } catch (e) {
                            result.msg = $.i18n.t('login:by_file.error_file') + e.message;
                        }
                        cb(result);
                    }
                    document.getElementById('key-file').addEventListener('change', onChange);
                }(afterUpload));

                async function afterUpload(resultUpload) {
                    try{
                        if(resultUpload.msg.length > 0) {
                            throw new LoginException(resultUpload.msg);
                        }
                        if(!resultUpload.data.keysPair || !resultUpload.data.keysPair.private){
                            throw new LoginException($.i18n.t('login:by_file.error_wrong_json'));
                        }
                        wallet.main.keysPair.private = resultUpload.data.keysPair.private;
                        wallet.address = iz3BitcoreCrypto.private2address(wallet.main.keysPair.private);
                        let loggedIn = await login();
                        if(true !== loggedIn){
                            throw new LoginException(loggedIn);
                        }
                        dialogRef.close();

                    } catch (e) {
                        if (!(e instanceof LoginException)) {
                            console.log('Key error: '+e.message);
                            e.message = $.i18n.t('login:by_file.error_wrong_key');
                        }
                        content.find('#message')
                            .html(e.message)
                            .show();
                        dialogRef
                            .getButton('file-select')
                            .enable();
                        dialogRef
                            .getButton('login')
                            .removeClass('btn-success')
                            .stopSpin();
                    }
                }
            },
        });

        var askLoginKeyDlg = new BootstrapDialog({
            title: $.i18n.t('login:by_key.header'),
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_LARGE,
            spinicon: 'fas fa-spinner fa-pulse',
            message: getLoginKeyDlgContent(true),
            buttons: [{
                id: 'login',
                label: $.i18n.t('login:by_key.btn_login'),
                cssClass: 'btn',
                action: function (dialogRef) {
                    dialogRef
                        .enableButtons(false)
                        .setClosable(false);
                    let content = dialogRef.getModalContent();
                    let key = String(content.find('#key').val() || false);
                    let $button = this;
                    $button.spin();
                    content.find('#message').hide();

                    (async function() {
                        try{
                            wallet.address = iz3BitcoreCrypto.private2address(key);
                            wallet.main.keysPair.private = key;
                            let loggedIn = await login();
                            if(true !== loggedIn){
                                throw new LoginException(loggedIn);
                            }
                            dialogRef.close();

                        } catch (e) {
                            if (!(e instanceof LoginException)) {
                                console.log('Key error: '+e.message);
                                e.message = $.i18n.t('login:by_key.error1');
                            }
                            content.find('#message')
                                .html(e.message)
                                .show();
                            dialogRef
                                .enableButtons(true)
                                .setClosable(true);
                            $button.stopSpin();
                        }
                    }());
                }
            }],
            onshow: function (dialogRef) {
                dialogRef.enableButtons(false);
                dialogRef.getModalFooter().css('text-align', 'center')
            },
            onshown: function (dialogRef) {
                let btn = dialogRef.getModalContent().find('#login') || false;
                if (btn) {
                    $('#key').on('keyup', function () {
                        if ($(this).val().length >= 1) {
                            if (!btn.hasClass('btn-success')) {
                                btn.addClass('btn-success');
                                dialogRef.enableButtons(true);
                            }
                        } else {
                            btn.removeClass('btn-success');
                            dialogRef.enableButtons(false);
                        }
                    });
                }
            },
        });

        async function login(){
            let result = '';
            try {
                await $.getJSON('/api/v1/wallet/login', {addr: wallet.address})
                    .done(function (resp) {
                        if (resp.success) {
                            $('section.sidebar', $('body')).html(resp.data.menu);
                            $('.content-wrapper', $('body')).html(resp.data.page);
                            walletIZ3.setCurrentNetwork();
                            walletIZ3.setEventListeners();
                            $('#dapps_wrapper', $('#dapps')).html('');
                            $('.wrapper').localize();

                            //window.history.pushState({"html":resp.data,"pageTitle":'TITLE 1'},"", '/interface/send-online');
                            //window.location.replace("/send/online");

                            result = true;
                        } else {
                            result = resp.msg;
                        }
                    })
                    .fail(function (resp) {
                        result = resp.responseJSON.message;
                    })
                    .always(function (resp) {
                    });
            } catch (e) {
                result = e.responseJSON.message || e.message;
            }
            return result;
        }

        function LoginException(message) {
            this.message = message;
            this.name = "LoginException";
        }

        function getLoginKeyDlgContent(showFields) {
            showFields = showFields || false;
            return '' +
                '<div id="message" class="row alert alert-danger" role="alert" style="border-radius: 0px; display: none;">' +
                '</div>' +
                (showFields
                    ?
                    (
                        '<div class="container-fluid">' +
                        '<div class="row">' +
                        '<div class="col-md-12 col-xs-12 form-group">' +
                        '<input type="text" id="key" placeholder="'+$.i18n.t('login:by_key.key_placeholder')+'" class="form-control input-lg" autocomplete="off">' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    )
                    :
                    (
                        '<input type="file" id="key-file" style="display: none">'
                    )
                );
        }

        var walletIZ3 = {
            tnsnOnlineForm: $('#tnsn_online'),
            tnsnOfflineForm: $('#tnsn_offline'),
            contractDeployForm: $('#contract_deploy'),
            DappContract: 0,
            network: {
                name: '',
                ticker: '',
                masterContract: false,
                icon: ''
            },
            setCurrentNetwork: function(){
                this.network.name = $('#network').val() || '';
                this.network.ticker = $('#ticker').val() || '';
                this.network.masterContract = String($('#masterContract').val() || false);
                this.network.icon = $('#icon').val() || '';
            },

            setEventListeners: function () {
                let body = $('body');
                $('#tnsn_online form', body).validate({
                    rules: {
                        contract_address: {
                            digits: true
                        },
                        type: {
                            required: true
                        },
                        amount: {
                            required: true,
                            number: true,
                            min: '0.00000000000000000001',
                        },
                        payee: {
                            required: true,
                            minlength: 30,
                            alphanumeric: true
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        if ($('#tnsn_online form').valid()) {
                            $('button.send', $('#tnsn_online'))
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            $('button.send', $('#tnsn_online'))
                                .prop('disabled', true)
                                .addClass('disabled');
                        }

                        if ($('#tnsn_online #contract_address').valid()) {
                            $('button.find-tokens', $('#tnsn_online'))
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            $('button.find-tokens', $('#tnsn_online'))
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('#tnsn_online #type').on('change', function () {
                    $('#tnsn_online #token-max span').html(($("option:selected", this).data('max') || 0));
                });

                $('#tnsn_online .find-tokens').on('click', function () {
                    let contractAddress = parseInt($('#contract_address', $('#tnsn_online')).val() || 0);

                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/contract/getInfo/' + contractAddress,
                        method: 'GET',
                        data: {'addr': ($('#payer').html() || '').trim()}
                    });
                    walletIZ3.HTTPRequest.send('resFindTokens');
                });

                $('#tnsn_online .send').on('click', function () {
                    let contractAddress = String($('#type', $('#tnsn_online')).val() || 0);
                    let block = new ecmaContractCallBlock(
                            contractAddress,
                            'transfer',
                            [
                                String($('#payee', this.tnsnOnlineForm).val() || false),
                                String($('#amount', this.tnsnOnlineForm).val() || false),
                            ],
                            {
                                'from': wallet.address,
                                'contractAddress': contractAddress
                            }
                        );
                    block.sign = iz3BitcoreCrypto.sign(block.data, wallet.main.keysPair.private);
                    block.pubkey = wallet.address;

                    $(this)
                        .prop('disabled', true)
                        .addClass('disabled');
                    $('.overlay', this.tnsnOnlineForm).show();

                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/transaction/online',
                        method: 'POST',
                        data: {'block': block, 'contractAddr': contractAddress}
                    });
                    walletIZ3.HTTPRequest.send('resTnsnOnline');
                });


                $('#tnsn_offline form', body).validate({
                    rules: {
                        type: {
                            required: true
                        },
                        amount: {
                            required: true
                        },
                        payee: {
                            required: true,
                            minlength: 30
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        if ($('#tnsn_offline form').valid()) {
                            $('button', this.tnsnOfflineForm)
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            $('button.send', this.tnsnOfflineForm)
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('#tnsn_offline .send').on('click', function () {
                    showSendedOfflineTransaction
                        .realize()
                        .getModalFooter().css('text-align', 'center');
                    let modalContent = showSendedOfflineTransaction.getModalContent();
                    let tnsnData = {
                        'to': $('#tnsn_offline #payee').val(),
                        'amount': $('#tnsn_offline #amount').val()
                    };
                    let tnsnSign = iz3BitcoreCrypto.sign(JSON.stringify(tnsnData), wallet.main.keysPair.private);

                    modalContent.find('#tnsn_id code').html(tnsnSign);
                    modalContent.find('#qrcode').qrcode({width: 140, height: 140, text: tnsnSign});
                    modalContent.find('#tnsn_row code').html(JSON.stringify(tnsnData));

                    $('#download', modalContent).on('click', function () {
                        download(
                            JSON.stringify({'rawTransaction': tnsnSign, 'tx': tnsnData}),
                            'signetTransaction-' + (Date.now()) + '.json',
                            'text/plain'
                        );
                    });

                    showSendedOfflineTransaction.open();
                });

                $('#tnsn_import').on('change', function () {
                    let file = this.files[0] || false;
                    let fileSize = file ? file.size : 0;
                    if(fileSize > 5120){
                        toastr['warning']($.i18n.t('tnsn_send_offline:error.file_too_big'));
                    } else {
                        let reader = new FileReader();
                        reader.onload = (function () {
                            return function (e) {
                                try {
                                    let tnsn = JSON.parse(e.target.result);
                                    $('#amount', this.tnsnOfflineForm).val((tnsn.tx.amount || ''));
                                    $('#payee', this.tnsnOfflineForm).val((tnsn.tx.to || ''));
                                    toastr['success']($.i18n.t('tnsn_send_offline:import_success'));
                                    if ($('#tnsn_offline form').valid()) {
                                        $('button', this.tnsnOfflineForm)
                                            .prop('disabled', false)
                                            .removeClass('disabled');
                                    } else {
                                        $('button.send', this.tnsnOfflineForm)
                                            .prop('disabled', true)
                                            .addClass('disabled');
                                    }
                                } catch (e) {
                                    toastr['warning']($.i18n.t('tnsn_send_offline:error.no_parsed') + e);
                                    $('button.send', this.tnsnOfflineForm)
                                        .prop('disabled', true)
                                        .addClass('disabled');
                                }
                            }
                        })();
                        reader.readAsText(file);
                    }
                });

                $('#dapps_select form', body).validate({
                    rules: {
                        dapp_contract_addr: {
                            required: true
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        let button = $('button', $('#dapps_select'));
                        if ($('form', $('#dapps_select')).valid()) {
                            button
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            button
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('.load-app', $('#dapps_select')).on('click', function () {
                    $('#dapps_wrapper', $('#dapps')).html('');
                    $('.overlay', $('#dapps_select')).show();
                    let contractAddress = parseInt(($('#dapp_contract_addr', $('#dapps_select')).val() || 0));
                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/dapps/getApp/'+contractAddress,
                        method: 'GET'
                    });
                    walletIZ3.HTTPRequest.send('resGetApp', contractAddress);
                });


                $('#step1 form', $('#contract_interact')).validate({
                    rules: {
                        deployed_contract_name: {
                            required: true
                        },
                        interact_who: {
                            required: true,
                        },
                        abi: {
                            required: true,
                            validJSON: true
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        let buttons = $('#step1 button', $('#contract_interact'));
                        if ($('#step1 form', $('#contract_interact')).valid()) {
                            buttons
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            buttons
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    },
                    onclick: function (element) {
                        $(element).valid();
                        let buttons = $('#step1 button', $('#contract_interact'));
                        if ($('#step1 form', $('#contract_interact')).valid()) {
                            buttons
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            buttons
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('#step2 form', $('#contract_interact')).validate({
                    rules: {
                        deployed_contract_action: {
                            required: true
                        },
                        resources: {
                            required: true,
                            number: true,
                            min: '0',
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        let buttons = $('#step2 button.do-interact', $('#contract_interact'));
                        if ($('#step2 form', $('#contract_interact')).valid()) {
                            buttons
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            buttons
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    },
                    onclick: function (element) {
                        $(element).valid();
                        let buttons = $('#step2 button.do-interact', $('#contract_interact'));
                        if ($('#step2 form', $('#contract_interact')).valid()) {
                            buttons
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            buttons
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('#deployed_contract_name', $('#contract_interact')).on('change', function () {
                    let selected = $(this).find(':selected');
                    let from = selected.data('from') || '';
                    $('#interact_who', $('#contract_interact')).val(from);
                    $('#abi', $('#contract_interact')).val('');
                    $('#interact_with', $('#contract_interact')).text($.i18n.t('contract_interact_s2:info') + selected.text());

                    let id = $(this).val() || '';
                    if(id.length){
                        $('.overlay', $('#contract_interact')).show();
                        walletIZ3.HTTPRequest.init({
                            url: '/api/v1/contract/getMethods/'+id,
                            method: 'GET',
                        });
                        walletIZ3.HTTPRequest.send('resGetContractInfo');
                    }
                });

                var interactedContract = new interactContract();
                $('#contract_interact .continue').on('click', function () {
                    $('#step1', $('#contract_interact')).hide();
                    $('#step2', $('#contract_interact')).show();
                    $('#interacting', $('#contract_interact')).val($('#interact_who', $('#contract_interact')).val() || '');

                    $('#add_fields', $('#contract_interact')).html('');
                    $('#interacting_result', $('#contract_interact')).val('');

                    interactedContract.abi = $('#abi', $('#contract_interact')).val();
                    let methods = interactedContract.getMethods();

                    let el = $('#deployed_contract_action', $('#contract_interact'));
                    el.children('option:not(:first)').remove();
                    $.each(methods, function (key, value) {
                    el
                        .append($("<option></option>")
                        .attr("value", value)
                        .text(value));
                    });

                    if (!$('#step2 form', $('#contract_interact')).valid()) {
                        let buttons = $('#step2 button.do-interact', $('#contract_interact'));
                        buttons
                            .prop('disabled', true)
                            .addClass('disabled');
                    }
                });
                $('#contract_interact .back').on('click', function () {
                    $('#step2', $('#contract_interact')).hide();
                    $('#step1', $('#contract_interact')).show();
                });

                let method = '';
                $('#deployed_contract_action', $('#contract_interact')).on('change', function () {
                    method = $(this).find(':selected').val();

                    $('#add_fields', $('#contract_interact')).html('');
                    $('#interacting_result', $('#contract_interact')).val('');

                    (async function () {
                        let blockNew = '';
                        let fields = interactedContract.getAdditionalFieldsOfMethod(method);
                        for (let i = 0; i < fields.length; i++) {
                            blockNew = await interactedContract.fieldToHTMLBlock(fields[i]);
                            $('#add_fields', $('#contract_interact')).append(blockNew);
                            $('.wrapper').localize();
                        }
                    })();
                });

                $('.do-interact', $('#contract_interact')).on('click', function () {
                    $('button', $('#contract_interact'))
                        .prop('disabled', true)
                        .addClass('disabled');
                    $('.overlay', $('#contract_interact')).show();

                    let data = {
                        'contract': $('#deployed_contract_name', $('#contract_interact')).find(':selected').val(),
                        'method': method
                    };
                    $('#add_fields input', $('#contract_interact')).each(function (i, v) {
                        data[$(this).attr('name')] = $(this).val();
                    });

                    data.waitingInResponse = interactedContract.getOutputsFormat(method);
                    if(data.waitingInResponse.length <= 0){
                        data.waitingInResponse = [{"name":"","type":"string"}];
                    }

                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/transaction/contractInteract',
                        method: 'GET',
                        data: data
                    });
                    walletIZ3.HTTPRequest.send('resInteractContract', data.waitingInResponse);
                });


                $('#contract_deploy form', body).validate({
                    rules: {
                        contract_code: {
                            required: true
                        },
                        contract_rent: {
                            required: false,
                            number: true,
                            min: '0',
                        }
                    },
                    highlight: function (element) {
                        $(element).addClass('error');
                    },
                    onkeyup: function (element) {
                        $(element).valid();
                        if ($('#contract_deploy form').valid()) {
                            $('button.sign', this.contractDeployForm)
                                .prop('disabled', false)
                                .removeClass('disabled');
                        } else {
                            $('button.sign', this.contractDeployForm)
                                .prop('disabled', true)
                                .addClass('disabled');
                        }
                    }
                });

                $('.calc-resource', $('#contract_deploy')).on('click', function () {
                    $('.overlay', $('#contract_deploy')).show();

                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/transaction/calcDeployContractResource/'+String(($('#contract_rent', $('#contract_deploy')).val() || 0)),
                        method: 'GET'
                    });
                    walletIZ3.HTTPRequest.send('resCalcDeployContractResource');
                });

                let block = '';
                let resourceRent = '';
                $('#contract_deploy .sign').on('click', function () {
                        resourceRent = ($('#contract_rent', this.contractDeployForm).val() || 0);
                        block = new ecmaContractDeployBlock(
                        String(($('#contract_code', this.contractDeployForm).val() || false)),
                        {
                            'resourceRent': resourceRent,
                            'from': wallet.address,
                            'contractAddress': walletIZ3.network.masterContract,
                            'randomSeed': walletIZ3.utility.getRandomInt()
                        }
                    );
                    block.sign = iz3BitcoreCrypto.sign(block.data, wallet.main.keysPair.private);
                    block.pubkey = wallet.address;
                    if(block.isSigned()){
                        confirmContractDeployDlg
                            .realize()
                            .getModalFooter().css('text-align', 'center');
                        let modalContent = confirmContractDeployDlg.getModalContent();
                        modalContent.find('img').attr('src', walletIZ3.network.icon);
                        modalContent.find('.amount').html('- ' + resourceRent);
                        modalContent.find('.currency').html(' ' + walletIZ3.network.ticker);
                        modalContent.find('.network').html(' ' + walletIZ3.network.ticker + ' by ' + walletIZ3.network.name);
                        modalContent.find('.address').html(($('#payer').html() || '').trim());
                        confirmContractDeployDlg.open();
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: $.i18n.t('contract_deploy:error.sign_create'),
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }
                });

                let successContractDeployDlg = new BootstrapDialog({
                    closable: true,
                    closeByBackdrop: false,
                    size: BootstrapDialog.SIZE_LARGE,
                    message: getSuccessContractDeployDlgContent()
                });

                let confirmContractDeployDlg = new BootstrapDialog({
                    title: $.i18n.t('contract_deploy:confirm:header'),
                    closable: true,
                    closeByBackdrop: false,
                    size: BootstrapDialog.SIZE_LARGE,
                    spinicon: 'fas fa-spinner fa-pulse',
                    message: getConfirmContractDeployDlgContent(),
                    buttons: [{
                        label: $.i18n.t('contract_deploy:confirm:btn_send'),
                        cssClass: 'btn btn-success',
                        action: function (dialogRef) {
                            dialogRef
                                .enableButtons(false)
                                .setClosable(false);
                            let content = dialogRef.getModalContent();
                            let $button = this;
                            $button.spin();
                            content.find('#message').hide();
                            try {
                                $.post(
                                    '/api/v1/transaction/deployContract',
                                    {
                                    'block': block,
                                    'rent': resourceRent
                                    },
                                    "json")
                                    .done(function (resp) {
                                        if (resp.success) {
                                            dialogRef.close();

                                            successContractDeployDlg.realize();
                                            successContractDeployDlg.getModalHeader().hide();
                                            successContractDeployDlg.getModalFooter().hide();
                                            let modalContent = successContractDeployDlg.getModalContent();
                                            $('#tnsn-check-status', modalContent).on('click', function () {
                                                alert('Open new window');
                                            });
                                            $('#close', modalContent).on('click', {dialogRef: successContractDeployDlg}, function (event) {
                                                $('#contract_code', this.contractDeployForm).val('');
                                                $('.sign', this.contractDeployForm)
                                                    .addClass('disabled')
                                                    .prop('disabled', true);
                                                event.data.dialogRef.close();
                                            });
                                            successContractDeployDlg.open();
                                        } else {
                                            content.find('#message')
                                                .html(resp.msg)
                                                .show();
                                        }
                                    })
                                    .fail(function (resp) {
                                        content.find('#message')
                                            .html(resp.msg)
                                            .show();
                                    })
                                    .always(function (resp) {
                                        dialogRef
                                            .enableButtons(true)
                                            .setClosable(true);
                                        $button.stopSpin();
                                    });
                            } catch (e) {
                                console.log(e);
                                content.find('#message')
                                    .html($.i18n.t('contract_deploy:confirm:error1'))
                                    .show();
                                dialogRef
                                    .enableButtons(true)
                                    .setClosable(true);
                                $button.stopSpin();
                            }
                        }
                    }]
                });

                function getConfirmContractDeployDlgContent() {
                    return '' +
                        '<div id="message" class="row alert alert-danger" role="alert" style="border-radius: 0px; display: none;">' +
                        '</div>' +
                        '<div class="container-fluid confirmation-contract-deploy">' +
                        '<div class="row">' +
                        '<div class="col-md-6 col-xs-12 main">' +
                        '<div class="icon-bg"><img></div>' +
                        '<p>' +
                        '<span class="amount"></span>' +
                        '<span class="currency"></span>' +
                        '</p>' +
                        '<div class="address-label">'+$.i18n.t('contract_deploy:confirm:addr_label')+'</div>' +
                        '<div class="address"></div>' +
                        '</div>' +
                        '</div>' +
                        '<hr style=" position: fixed; width: 100%; left: 0px; ">' +
                        '<div class="row detail-header">' +
                        '<div class="col-md-12 col-xs-12"><h4>'+$.i18n.t('contract_deploy:confirm:details_header')+'</h4></div>' +
                        '</div>' +
                        '<div class="row detail-item">' +
                            '<div class="col-md-6 col-sm-6 hidden-xs text-left">'+$.i18n.t('contract_deploy:confirm:detail_network')+'</div>' +
                            '<div class="col-md-6 col-sm-6 hidden-xs text-right network"></div>' +
                                '<div class="hidden-lg hidden-md hidden-sm col-xs-12">' +
                                    '<dl><dt>'+$.i18n.t('contract_deploy:confirm:detail_network')+'</dt><dd class="network"></dd></dl>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                }

                function getSuccessContractDeployDlgContent() {
                    return '' +
                        '<div class="container-fluid text-center">' +
                        '<div class="row">' +
                        '<i class="far fa-check-circle fa-7x text-success"></i>' +
                        '</div>' +
                        '<div class="row">' +
                        '<h2 style=" font-weight: 700; color: #003945; ">'+$.i18n.t('contract_deploy:success:header')+'</h2>'+
                        '</div>' +
                        '<div class="row" style=" color: #506175; font-size: 16px; margin-top: 15px; margin-bottom: 40px;">' +
                        $.i18n.t('contract_deploy:success:description1') +
                        '</div>' +
                        '<div class="row">' +
                        '<div class="col-md-12">' +
                        '<div class="col-lg-2 col-md-2 col-sm-1 hidden-xs">' +
                        '</div>' +
                        '<div class="col-lg-8 col-md-8 col-sm-10 col-xs-12">' +
                        '<button class="btn btn-default btn-lg btn-block disabled" disabled id="tnsn-check-status">'+$.i18n.t('contract_deploy:success:btn_check_status')+'</button>' +
                        '</div>' +
                        '<div class="col-lg-2 col-md-2 col-sm-1 hidden-xs">' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<br />' +
                        '<div class="row">' +
                        '<div class="col-md-12">' +
                        '<div class="col-lg-2 col-md-2 col-sm-1 hidden-xs">' +
                        '</div>' +
                        '<div class="col-lg-8 col-md-8 col-sm-10 col-xs-12">' +
                        '<button class="btn btn-success btn-lg btn-block" id="close">'+$.i18n.t('contract_deploy:success:btn_ok')+'</button>' +
                        '</div>' +
                        '<div class="col-lg-2 col-md-2 col-sm-1 hidden-xs">' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    ;
                }


                body.off('click', '.autocopy');
                body.on('click', '.autocopy', function () {
                    let target = $(this).data('iz3-need-copy') || false;
                    walletIZ3.utility.copy(target);
                });

                $('#balance_refresh').on('click', function () {
                    let icon = $(this).find('i');
                    if(icon.hasClass('fa-spin')){
                        return false;
                    }
                    icon.addClass('fa-spin');
                    let contractAddress = ($('#payer').html() || '').trim();
                    walletIZ3.HTTPRequest.init({
                        url: '/api/v1/wallet/balanceOf/'+contractAddress,
                        method: 'GET'
                    });
                    walletIZ3.HTTPRequest.send('resBalanceRefresh');
                });

            },
            HTTPRequest: {
                defaults: {
                    method: 'GET'
                },
                settings: {},
                data: '',
                init: function (options) {
                    options = options || false;
                    if (options) {
                        this.settings = walletIZ3.utility.extend(this.defaults, options);
                    } else {
                        this.settings = walletIZ3.utility.extend(this.defaults, this.defaults);
                    }
                },
                send: function (callback, waitingInResponse) {
                    $.ajax({
                        url: this.settings.url,
                        method: this.settings.method,
                        data: this.settings.data,
                        dataType: 'json',
                    })
                    /*
                    .done(function (resp) {
                        if (callback) {
                            walletIZ3.callbacks[callback](resp);
                        }
                    })
                    .fail(function (resp) {
                        if (callback) {
                            walletIZ3.callbacks[callback](resp);
                        }
                    })
                    */

                    .always(function (resp) {
                        if (callback) {
                            if(HTTPRequest.settings.cbStandalone){
                                callback(resp, waitingInResponse);
                            } else {
                                walletIZ3.callbacks[callback](resp, waitingInResponse);
                            }
                        }
                    });
                }
            },
            callbacks: {
                resFindTokens: function(resp) {
                    if (resp.success) {
                        let msg = $.i18n.t('tnsn_send_online:tkn_type_exist');
                        let optionExists = ($('#type option[value=' + resp.data.token.from_contract + ']', $('#tnsn_online')).length > 0);
                        if(!optionExists)
                        {
                            $('#type', $('#tnsn_online')).append("<option value='"+resp.data.token.from_contract+"' data-max='"+resp.data.balance+"'>"+resp.data.token.name+"</option>");
                            msg = $.i18n.t('tnsn_send_online:tkn_type_added');
                        }
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_success'),
                            message: msg,
                            type: BootstrapDialog.TYPE_INFO,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                        $('input', $('#tnsn_online')).val('');
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                        $('button', $('#tnsn_online'))
                            .prop('disabled', false)
                            .removeClass('disabled');
                    }
                    $('.overlay', $('#tnsn_online')).hide();
                },
                resTnsnOnline: function (resp) {
                    if (resp.success) {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_success'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_INFO,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                        $('input', $('#tnsn_online')).val('');
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                        $('button', $('#tnsn_online'))
                            .prop('disabled', false)
                            .removeClass('disabled');
                    }
                    $('.overlay', this.tnsnOnlineForm).hide();
                },

                resGetContractInfo: function (resp) {
                    if (resp.success) {
                        $('#abi', $('#contract_interact')).val(resp.data.contract.abi);
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }

                    let buttons = $('#step1 button', $('#contract_interact'));
                    if ($('#step1 form', $('#contract_interact')).valid()) {
                        buttons
                            .prop('disabled', false)
                            .removeClass('disabled');
                    } else {
                        buttons
                            .prop('disabled', true)
                            .addClass('disabled');
                    }
                    $('.overlay', $('#contract_interact')).hide();
                },

                resInteractContract: function (resp, waitingInResponse) {
                    let fieldName = '';
                    let result = '';
                    if (resp.success) {
                        waitingInResponse = waitingInResponse || [];
                        resp.data = JSON.parse(resp.data) || [];
                        switch (waitingInResponse.length) {
                            case 0:
                                result = resp;
                                break;
                            case 1:
                                for(let i = 0; i < waitingInResponse.length; i ++){
                                    fieldName = waitingInResponse[i].name || false;
                                    if(fieldName){
                                        if (resp.data.hasOwnProperty(fieldName)) {
                                            result = resp.data[fieldName];
                                        }
                                    } else {
                                        result = resp.data[0];
                                    }
                                }
                                break;
                            default:
                                for(let i = 0; i < waitingInResponse.length; i ++){
                                    fieldName = waitingInResponse[i].name || false;
                                    if(fieldName){
                                        if (resp.data.hasOwnProperty(fieldName)) {
                                            result += fieldName+': '+resp.data[fieldName]+', ';
                                        }
                                    } else {
                                        result = resp.data[0];
                                    }
                                }
                        }
                        $('#interacting_result', $('#contract_interact')).val(result);
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }
                    $('button', $('#contract_interact'))
                        .prop('disabled', false)
                        .removeClass('disabled');
                    $('.overlay', $('#contract_interact')).hide();
                },

                resCalcDeployContractResource: function (resp) {
                    if (resp.success) {
                        $('#resources_calculated', $('#contract_deploy')).html(resp.data);
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }
                    $('.overlay', $('#contract_deploy')).hide();
                },

                resGetApp: function (resp, contractAddress) {
                    if (resp.success && false != resp.data) {
                        resp.data = JSON.parse(resp.data);

                        let dappsHandler = new dappOuter(contractAddress, resp.data);
                        dappsHandler.init(this.DappContract);
                        sessionStorage.setItem('contractAddress', contractAddress);
                        this.DappContract = contractAddress;

                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg.length ? resp.msg : $.i18n.t('dapps:error.not_found'),
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }
                    $('.overlay', $('#dapps')).hide();
                },

                resBalanceRefresh: function (resp) {
                    if (resp.success) {
                        $('#balance').html(resp.data.balance);
                        $('#balance_refresh').find('i').removeClass('fa-spin');
                    } else {
                        BootstrapDialog.alert({
                            title: $.i18n.t('dialog_alerts:header_error'),
                            message: resp.msg,
                            type: BootstrapDialog.TYPE_DANGER,
                            size: BootstrapDialog.SIZE_LARGE,
                            closable: true
                        });
                    }
                }
            },
            utility: {
                extend: function (defaults, options) {
                    var extended = {};
                    var prop;
                    for (prop in defaults) {
                        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                            extended[prop] = defaults[prop];
                        }
                    }
                    for (prop in options) {
                        if (Object.prototype.hasOwnProperty.call(options, prop)) {
                            extended[prop] = options[prop];
                        }
                    }
                    return extended;
                },
                copy: function (selector) {
                    try {
                        var range, selection;
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText(selector);
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            range = document.createRange();
                            range.selectNodeContents(document.getElementById(selector));
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        document.execCommand('copy');

                        if (window.getSelection) {
                            window.getSelection().removeAllRanges();
                        } else if (document.selection) {
                            document.selection.empty();
                        }
                        toastr['info']($.i18n.t('copy_alerts:success'));
                    } catch (e) {
                        toastr['warning']($.i18n.t('copy_alerts:error'));
                        console.log(e);
                    }
                },
                getRandomInt: function(min, max) {
                    min = min || 100;
                    max = max || 1000000;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
            },
            transaction: {
                online: {
                    checkReady: function () {
                        $('#amount').on('change', function () {
                            alert($(this).val());
                        })
                    }
                },
                offline: {}
            }
        };
        window.HTTPRequest = walletIZ3.HTTPRequest;

        var showSendedOfflineTransaction = new BootstrapDialog({
            title: $.i18n.t('tnsn_send_offline:tnsn_generated.header'),
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_LARGE,
            message: getSendedOfflineTransactionDlgContent(),
            buttons: [{
                id: 'continue',
                label: $.i18n.t('tnsn_send_offline:tnsn_generated.btn_continue'),
                cssClass: 'btn btn-success autocopy',
                data: {'iz3-need-copy': 'tnsn_id'},
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }],
            onshow: function (dialogRef) {
            },
            onshown: function (dialogRef) {
            },
        });

        function getSendedOfflineTransactionDlgContent() {
            return '' +
                '<div class="container-fluid tnsn-offline-result">' +
                '<h4>'+$.i18n.t('tnsn_send_offline:tnsn_generated.tnsn_signed_label')+'</h4>' +
                '<div class="row">' +
                '<div class="col-md-12 col-xs-12">' +
                '<div id="tnsn_id" class="tnsn_block" style="word-break: break-word;">' +
                '<code></code>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<h4>'+$.i18n.t('tnsn_send_offline:tnsn_generated.tnsn_qr_code_label')+'</h4>' +
                '<div class="row">' +
                '<div class="col-md-4 hidden-xs">' +
                '</div>' +
                '<div class="col-md-4 col-xs-12 text-center">' +
                '<div id="qrcode">' +
                '</div>' +
                '<div style="font-size: 15px; margin-top: 10px;">or<br /><a href="#" id="download">'+$.i18n.t('tnsn_send_offline:tnsn_generated.tnsn_in_json')+'</a></div>' +
                '</div>' +
                '<div class="col-md-4 hidden-xs">' +
                '</div>' +
                '</div>' +
                '<h4>'+$.i18n.t('tnsn_send_offline:tnsn_generated.tnsn_raw_label')+'</h4>' +
                '<div class="row">' +
                '<div class="col-md-12 col-xs-12">' +
                '<div id="tnsn_row" class="tnsn_block" style="word-break: break-word;">' +
                '<code style="color: darkgrey;"></code>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
    })();

    /*
    function encode( s ) {
        var out = [];
        for ( var i = 0; i < s.length; i++ ) {
            out[i] = s.charCodeAt(i);
        }
        return new Uint8Array( out );
    }
    */
});