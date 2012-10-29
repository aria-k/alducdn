/*
 * JavaScript file created by Rockstarapps Concatenation
*/

/*
 * START OF FILE - /alducdn/aldu/latest/src/aldu.ui.js
 */
Aldu.extend({
  UI : {
    engine : null,
    processHtml : function(context) {
      Aldu.UI.Form.init(context);
      Aldu.UI.Table.init(context);
      Aldu.UI.Panel.init(context);
      Aldu.each(Aldu.UI._processCallbacks, function(i, callback) {
        callback.call(this, context);
      });
    },
    _processCallbacks : [],
    addProcessCallback : function(callback) {
      Aldu.UI._processCallbacks.push(callback);
    },
    init : function(context) {
      return Aldu.UI.processHtml(context);
    }
  }
});

/*
 * END OF FILE - /alducdn/aldu/latest/src/aldu.ui.js
 */

/*
 * START OF FILE - /alducdn/aldu/latest/src/aldu.ui.table.js
 */
Aldu.UI.Table = {
  init : function(context) {
    $('table.aldu-helpers-html-table', context).autoload(
      'jquery.datatables',
      {
        extras : [ 'tabletools' ]
      },
      function(i, table) {
        if ($(table).hasClass('aldu-core-view-index')) {
          var aoColumns = [];
          $('thead th', table).each(function(i, th) {
            if ($(th).hasClass('sortable')) {
              aoColumns.push({
                bSortable : true
              });
            }
            else {
              aoColumns.push({
                bSortable : false
              });
            }
          });
          var indexTable = $(table).dataTable(
            {
              sDom : 'Trtlip',
              //bJQueryUI : Aldu.CDN.isLoaded('jquery.ui'),
              oTableTools : {
                aButtons : [ {
                  sExtends : 'copy',
                  mColumns : 'sortable',
                  bFooter : false
                }, {
                  sExtends : 'xls',
                  mColumns : 'sortable',
                  bFooter : false
                }, {
                  sExtends : 'pdf',
                  sPdfOrientation : 'landscape',
                  mColumns : 'sortable',
                  bFooter : false
                } ]
              },
              // sScrollX : '100%',
              bAutoWidth : false,
              bProcessing : true,
              bServerSide : true,
              sAjaxSource : $(this).data('source') + ':table',
              iDeferLoading : $(this).data('total'),
              sPaginationType : 'links',
              iDisplayLength : $('tbody tr', table).length,
              aoColumns : aoColumns,
              aLengthMenu : [ [ 5, 10, 25, 50, -1 ],
                [ 5, 10, 25, 50, Aldu.t('All') ] ],
              fnDrawCallback : function(oSettings) {
                var tbody = $('tbody', this);
                Aldu.UI.processHtml(tbody);
                $('tbody tr td div[data-url].editable', this).autoload(
                  'jquery.jeditable',
                  function(i, td) {
                    var url = $(td).data('url');
                    var type = $(td).data('type');
                    var load = $(td).data('load');
                    var attribute = url.split('/').pop();
                    $(td).editable(
                      url,
                      {
                        name : attribute,
                        placeholder : '<span class="editable-click">'
                          + Aldu.t('Click to edit') + '</span>'
                      });
                  });
              },
              fnServerParams : function(aoData) {
                var oSettings = this.fnSettings();
                var iSearchingCols = 0;
                for ( var i in oSettings.aoPreSearchCols) {
                  if (oSettings.aoPreSearchCols[i].sSearch) {
                    var attribute = $(oSettings.aoColumns[i].nTh).data(
                      'name');
                    aoData.push({
                      name : 'sSearchCol_' + i,
                      value : attribute
                    });
                    iSearchingCols++;
                  }
                }
                aoData.push({
                  name : 'iSearchingCols',
                  value : iSearchingCols
                });
                for ( var i in oSettings.aaSorting) {
                  var attribute = $(
                    oSettings.aoColumns[oSettings.aaSorting[i][0]].nTh)
                    .data('name');
                  aoData.push({
                    name : "sSortCol_" + i,
                    value : attribute
                  });
                }
              }
            });
          $('thead th.aldu-core-model-actions', table).each(
            function(i, th) {
              var index = $('thead th', table).index(th);
              var checkbox = $('<input>').attr({
                type : 'checkbox'
              }).on(
                'click.ui.aldu',
                function(event) {
                  $('tbody tr', table).each(
                    function(i, tr) {
                      $('td', tr).eq(index).find('input:checkbox').prop(
                        'checked', $(event.target).prop('checked'));
                    });
                });
              var form = $('<form>').attr({
                id : table.id + '-actions',
                action : $(table).data('source') + ':pdf',
                method : 'get'
              }).addClass('aldu-core-model-actions');
              var submit = $('<input>').attr({
                type : 'submit'
              }).addClass(
                'aldu-core-model-action aldu-core-model-action-view').val(
                'PDF');
              form.append(submit);
              $('tfoot th', table).eq(index).append(checkbox, form);
            });
          $('thead th.searchable', table).not('.select').each(
            function(i, th) {
              var title = $(th).text();
              var input = $('<input>');
              input.attr({
                type : 'search',
                results : 5,
                placeholder : title,
                name : $(th).data('name')
              });
              input.data('source', $(table).data('source'));
              var index = $('thead th', table).index(th);
              input.on('keyup.ui.aldu click.ui.aldu', function() {
                var input = this;
                if (typeof timeout != 'undefined') {
                  clearTimeout(timeout);
                }
                timeout = setTimeout(function() {
                  indexTable.fnFilter(input.value, index);
                }, 1500);
              });
              $('tfoot th', table).eq(index).append(input);
            });
          $('thead th.searchable.select', table).each(
            function(i, th) {
              var index = $('thead th', table).index(th);
              var title = $(th).text();
              var select = $('<select>');
              var option = $('<option>').text(
                Aldu.t('Filter') + ' ' + title);
              select.append(option);
              $.ajax({
                url : '/technogel/sleeping/dealers/ajax',
                success : function(models) {
                  if (models.length) {
                    var option = 'country';
                    var unique = {};
                    options = [];
                    $.each(models, function(i, model) {
                      if (!(model[option] in unique)) {
                        unique[model[option]] = true;
                        options.push(model[option]);
                      }
                    });
                  }
                  $(select).updateOptions({
                    url : '/aldu/geolocation/country/ajax',
                    data : {
                      search : {
                        id : options
                      }
                    },
                    key : 'id',
                    values : [ 'name' ],
                    removeFirst : false
                  });
                }
              });
              select.on('change.ui.aldu', function() {
                if (this.value) {
                  indexTable.fnFilter(this.value, index);
                }
              });
              $('tfoot th', table).eq(index).append(select);
            });
        }
        else if ($(table).hasClass('aldu-core-view-tags')) {
          var taggedTable = $(
            'table.aldu-helpers-html-table.aldu-core-view-tagged tbody', $(
              table).closest('.aldu-core-view-tags-fieldset'));// .dataTable();
          var tagsTable = $(table).dataTable(
            {
              sDom : 'lrtip',
              bSort : false,
              bAutoWidth : false,
              bProcessing : true,
              bServerSide : true,
              sAjaxSource : $(this).data('source') + ':json',
              iDeferLoading : $(this).data('total'),
              sPaginationType : 'links',
              iDisplayLength : $('tbody tr', table).length,
              aLengthMenu : [ [ 5, 10, 25, 50, -1 ],
                [ 5, 10, 25, 50, Aldu.t('All') ] ],
              fnServerParams : function(aoData) {
                var oSettings = this.fnSettings();
                for ( var i in oSettings.aaSorting) {
                  var attribute = $(
                    oSettings.aoColumns[oSettings.aaSorting[i][0]].nTh)
                    .data('name');
                  aoData.push({
                    name : "sSortCol_" + i,
                    value : attribute
                  });
                }
                aoData.push({
                  name : 'sTableId',
                  value : $(table).attr('id')
                });
                var excluded = [];
                var rows = $('tr', taggedTable);// taggedTable.fnGetNodes();
                for ( var i = 0; i < rows.length; i++) {
                  excluded.push(rows[i].id.split('-').pop());
                }
                aoData.push({
                  name : 'aiExclude',
                  value : excluded.join(',')
                });
              },
              fnDrawCallback : function(oSettings) {
                var tagsTable = this;
                tagsTable.$('td:first-child input').on(
                  'change.ui.aldu',
                  function() {
                    var row = $(this).closest('tr');
                    $(this).off('change.ui.aldu');
                    // taggedTable.fnAddTr(row[0]);
                    taggedTable.append(row);
                    taggedTable.sortable('refresh').trigger('sortupdate');
                    // Since
                    // trigger('sortupdate')
                    // doesn't
                    // work!
                    $('tr input[name*="[weight]"]', taggedTable).each(
                      function() {
                        var tr = $(this).closest('tr');
                        var weight = tr.index();
                        $(this).val(weight);
                      });
                    tagsTable.fnDeleteRow(row[0]);
                  });
              }
            });
          $('thead th.searchable', table).not('.select').each(
            function(i, th) {
              var title = $(th).text();
              var input = $('<input>');
              input.attr({
                type : 'search',
                results : 5,
                placeholder : title
              });
              var index = $('thead th', table).index(th);
              input.on('keyup.ui.aldu click.ui.aldu', function() {
                tagsTable.fnFilter(this.value, index);
              });
              $('tfoot th', table).eq(index).append(input);
            });
          $('thead th.searchable.select', table).each(
            function(i, th) {
              var index = $('thead th', table).index(th);
              var title = $(th).text();
              var select = $('<select>');
              var option = $('<option>').text(
                Aldu.t('Filter') + ' ' + title);
              select.append(option);
              var aData = tagsTable.fnGetColumnData(index, true, true,
                true, true);
              for ( var i = 0; i < aData.length; i++) {
                var value = aData[i];
                option = $('<option>').val(value).text(value);
                select.append(option);
              }
              select.on('change.ui.aldu', function() {
                tagsTable.fnFilter(this.value, index);
              });
              $('tfoot th', table).eq(index).append(select);
            });
        }
        else if ($(table).hasClass('aldu-core-view-tagged')) {
          $('tbody', table).sortable(
            {
              update : function(event, ui) {
                $('tr input[name*="[weight]"]', event.target).each(
                  function() {
                    var tr = $(this).closest('tr');
                    var weight = tr.index();
                    $(this).val(weight);
                  });
              }
            });
        }
      });
  }
};

/*
 * END OF FILE - /alducdn/aldu/latest/src/aldu.ui.table.js
 */

/*
 * START OF FILE - /alducdn/aldu/latest/src/aldu.ui.form.js
 */
Aldu.UI.Form = {
  validator : function(element) {
    $(element).autoload(
      'jquery.tools',
      function(i, element) {
        $(element).validator(
          {
            // onBeforeFail : function(event, el) {},
            messageClass : 'validation-bubble',
            position : 'bottom left',
            offset : [
              12, 0
            ],
            message : '<div class="ui-state-error">'
              + '<em class="ui-state-error"></em>'
              + '<span class="ui-icon ui-icon-alert"></span></div>'
          });
      });
  },
  init : function(context) {
    $('form', context).autoload(
      'jquery.tools',
      function(i, form) {
        Aldu.log('Aldu.UI.Form.init', 2);
        if (!form.elements.length) {
          var container = $(form).parent();
          $('div.aldu-core-view-helper-html-form', container).remove();
          $(form).siblings().appendTo(form);
        }
        $.tools.validator.fn('[data-equals]', Aldu
          .t("Value not equal with the $1 field."), function(input) {
          var id = input.data('equals');
          var field = $('#' + id);
          var name = field.siblings('label').text();
          var valid = input.val() == field.val();
          return valid ? true : [
            name
          ];
        });
        // Aldu.UI.Form.validator(form);
        $(form.elements).filter('select').autoload('jquery.chosen',
          function(i, select) {
            $(select).chosen({
              'allow_single_deselect' : true
            });
          });
        $(form.elements).filter('input[data-fields]').autoload('jquery.tagit',
          function(i, input) {
            var fields = $(input).data('fields').split(',');
            var labelField = $(input).data('label');
            var valueField = $(input).data('value');
            $(input).tagit({
              tagSource : function(request, response) {
                var $or = [];
                var $and = [];
                $.each(fields, function(i, field) {
                  var or = {};
                  var nin = {};
                  or[field] = '/^' + request.term + '/';
                  nin[field] = {
                    '$nin' : input.value.split(',')
                  };
                  $or.push(or);
                  $and.push(nin);
                });
                var search = {
                  '$or' : $or,
                  '$and' : $and
                };
                $.ajax({
                  'url' : $(input).data('source'),
                  'data' : {
                    'render' : 'json',
                    'search' : search
                  },
                  'success' : function(data) {
                    response($.map(data, function(model) {
                      return {
                        'value' : model[valueField]
                      };
                    }));
                  }
                });
              }
            });
          });
        $(form.elements).filter('textarea[data-editor=codemirror]').autoload(
          'codemirror', {
            modes : [
              'php', 'markdown'
            ],
            themes : [
              'eclipse', 'night', 'cobalt', 'monokai'
            ]
          }, function(i, textarea) {
            var mode = $(textarea).data('mode') || 'text/x-markdown';
            var theme = $(textarea).data('theme') || 'eclipse';
            $(textarea).codemirror({
              mode : mode,
              lineNumbers : true,
              lineWrapping : true,
              readOnly : $(textarea).prop('readonly'),
              theme : theme
            });
          });
        $(form.elements).filter('textarea[data-editor=ckeditor]').autoload(
          'ckeditor',
          function(i, textarea) {
            $(textarea).ckeditor(
              {
                toolbar : 'Aldu',
                toolbar_Aldu : [
                  {
                    name : 'basicstyles',
                    items : [
                      'Bold', 'Italic', 'Underline', 'Strike', 'Subscript',
                      'Superscript', '-', 'RemoveFormat'
                    ]
                  },
                  {
                    name : 'paragraph',
                    items : [
                      'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent',
                      '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft',
                      'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-',
                      'BidiLtr', 'BidiRtl'
                    ]
                  }, {
                    name : 'links',
                    items : [
                      'Link', 'Unlink', 'Anchor'
                    ]
                  }, {
                    name : 'insert',
                    items : [
                      'Image', 'Table', '-', 'Source'
                    ]
                  }
                ],
                removePlugins : 'resize',
                extraPlugins : 'autogrow,codemirror',
                autoGrow_onStartup : true,
                forcePasteAsPlainText : true,
                basicEntities : false,
                entities : false,
                contentsCss : [
                  'aldu.ui.base.css'
                ],
                ignoreEmptyParagraph : true,
                autoParagraph : true,
                filebrowserBrowseUrl : '/aldu/media/files',
              });
          });
        $('fieldset', context).each(
          function(i, fieldset) {
            var children = $(fieldset).children();
            var legend = $('legend', fieldset).first();
            legend.addClass('pointer');
            var div = $('<div></div>').append(children).appendTo(fieldset);
            $(fieldset).prepend(legend);
            if ($(fieldset).hasClass('collapsed')
              || $(fieldset).parents('fieldset').length) {
              $(fieldset).addClass('collapsed');
              div.hide();
            }
            $('.aldu-core-view-helper-html-form-element', legend).click(
              function(e) {
                e.stopPropagation();
              });
            $(':checkbox, :radio', legend).change(
              function(e) {
                if ($(this).is(':not(:checked)')) {
                  $(this).closest('fieldset').find(':checkbox').prop('checked',
                    false);
                }
                if ($(this).is(':checked')) {
                  $(fieldset).removeClass('collapsed');
                  div.slideDown();
                }
              });
            $(':checkbox, :radio', fieldset).change(
              function() {
                if ($(this).is(':checked')) {
                  $(fieldset).children('legend').find(':checkbox').prop(
                    'checked', true);
                }
              });
            legend.click(function(e) {
              $(fieldset).toggleClass('collapsed');
              div.slideToggle();
            });
          });
      });
    Aldu.UI.Form.datetime(context);
  },
  datetime : function(context) {
    $('input[type=date]', context).each(function(i, date) {
      if (date.type !== 'date') {
        var clone = $(this).clone();
        clone.attr('id', '_' + clone.attr('id'));
        clone.removeAttr('name');
        clone.insertBefore(this);
        $(this).hide();
        var options = {
          altField : this,
          altFormat : 'yy-mm-dd',
          changeYear : true
        };
        clone.datepicker(options);
        if (clone.prop('required')) {
          clone.datepicker('setDate', new Date(this.value.replace(/ /, 'T')));
        }
      }
    });
  }
};

/*
 * END OF FILE - /alducdn/aldu/latest/src/aldu.ui.form.js
 */

/*
 * START OF FILE - /alducdn/aldu/latest/src/aldu.ui.panel.js
 */
Aldu.UI.Panel = {
  init : function(context) {
    Aldu.ready(function() {
      $('.aldu-ui-panel').each(function(i, panel) {
        var status = $(panel).data('status');
        var height = $(panel).outerHeight(true);
        var parent = $(panel).parent();
        switch (status) {
        case 'off':
          parent.animate({
            'height' : "0px"
          });
          break;
        case 'on':
        default:
          parent.animate({
            'height' : height + "px"
          });
        }
        $(panel).css('position', 'fixed');
        $('a.toggle', panel).click(function() {
          $(this).toggleClass('toggle-active');
          var shortcuts = $('.aldu-core-view-shortcuts');
          var status = shortcuts.data('status');
          var height = $(this).outerHeight(true);
          switch (status) {
          case 'off':
            $(panel).parent().animate({
              height : '+=' + height
            });
            shortcuts.slideDown();
            status = 'on';
            break;
          case 'on':
          default:
            $(panel).parent().animate({
              height : '-=' + height
            });
            shortcuts.slideUp();
            status = 'off';
            break;
          }
          $(shortcuts).data('status', status);
        });
      });
    });
  }
};

/*
 * END OF FILE - /alducdn/aldu/latest/src/aldu.ui.panel.js
 */

/*
 * JavaScript file created by Rockstarapps Concatenation
*/
