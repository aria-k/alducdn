Aldu.extend({
  UI : {
    Table : {
      init : function(context) {
        $('table.aldu-helpers-html-table', context).autoload('jquery.datatables', {
          extras : [ 'tabletools' ]
        }, function(i, table) {
          if ($(table).hasClass('aldu-core-view-index')) {
            var aoColumns = [];
            $('thead th', table).each(function(i, th) {
              if ($(th).hasClass('sortable')) {
                aoColumns.push( { bSortable : true } );
              }
              else {
                aoColumns.push( { bSortable : false } );
              }
            });
            var indexTable = $(table).dataTable({
              sDom : 'Trtlip',
              oTableTools : {
                aButtons: [
                           {
                             sExtends : 'copy',
                             mColumns : 'sortable',
                             bFooter : false
                           },
                           {
                             sExtends : 'xls',
                             mColumns : 'sortable',
                             bFooter : false
                           },
                           {
                             sExtends : 'pdf',
                             sPdfOrientation : 'landscape',
                             mColumns : 'sortable',
                             bFooter : false
                           }
                          ]
              },
              //sScrollX : '100%',
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
                $('tbody tr td div[data-url].editable', this).autoload('jquery.jeditable', function(i, td) {
                  var url = $(td).data('url');
                  var type = $(td).data('type');
                  var load = $(td).data('load');
                  var attribute = url.split('/').pop();
                  $(td).editable(url, {
                    name : attribute,
                    placeholder : '<span class="editable-click">' + Aldu.t('Click to edit') + '</span>'
                  });
                });
              },
              fnServerParams : function (aoData) {
                var oSettings = this.fnSettings();
                var iSearchingCols = 0;
                for (var i in oSettings.aoPreSearchCols) {
                  if (oSettings.aoPreSearchCols[i].sSearch) {
                    var attribute = $(oSettings.aoColumns[i].nTh).data('name');
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
                for (var i in oSettings.aaSorting) {
                  var attribute = $(oSettings.aoColumns[oSettings.aaSorting[i][0]].nTh).data('name');
                  aoData.push({ 
                    name : "sSortCol_" + i,
                    value : attribute
                  }); 
                }
              }
            });
            $('thead th.searchable', table).not('.select').each(function(i, th) {
              var title = $(th).text();
              var input = $('<input>');
              input.attr({
                type : 'search',
                results : 5,
                placeholder : title
              });
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
            $('thead th.searchable.select', table).each(function(i, th) {
              var index = $('thead th', table).index(th);
              var title = $(th).text();
              var select = $('<select>');
              var option = $('<option>').text(Aldu.t('Filter') + ' ' + title);
              select.append(option);
              select.on('change.ui.aldu', function() {
                if (this.value) {
                  indexTable.fnFilter(this.value, index);
                }
              });
              $('tfoot th', table).eq(index).append(select);
            });
          }
          else if ($(table).hasClass('aldu-core-view-tags')) {
            var taggedTable = $('table.aldu-helpers-html-table.aldu-core-view-tagged tbody', $(table).closest('.aldu-core-view-tags-fieldset'));//.dataTable();
            var tagsTable = $(table).dataTable({
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
              fnServerParams : function (aoData) {
                var oSettings = this.fnSettings();
                for (var i in oSettings.aaSorting) {
                  var attribute = $(oSettings.aoColumns[oSettings.aaSorting[i][0]].nTh).data('name');
                  aoData.push( { 
                    name : "sSortCol_" + i,
                    value : attribute
                  }); 
                }
                aoData.push({
                  name : 'sTableId',
                  value : $(table).attr('id')
                });
                var excluded = [];
                var rows = $('tr', taggedTable);//taggedTable.fnGetNodes();
                for (var i = 0; i < rows.length; i++) {
                  excluded.push(rows[i].id.split('-').pop());
                }
                aoData.push({
                  name : 'aiExclude',
                  value : excluded.join(',')
                });
              },
              fnDrawCallback : function(oSettings) {
                var tagsTable = this;
                tagsTable.$('td:first-child input').on('change.ui.aldu', function() {
                  var row = $(this).closest('tr');
                  $(this).off('change.ui.aldu');
                  //taggedTable.fnAddTr(row[0]);
                  taggedTable.append(row);
                  taggedTable.sortable('refresh').trigger('sortupdate');
                  // Since trigger('sortupdate') doesn't work!
                  $('tr input[name*="[weight]"]', taggedTable).each(function() {
                    var tr = $(this).closest('tr');
                    var weight = tr.index();
                    $(this).val(weight);
                  });
                  tagsTable.fnDeleteRow(row[0]);
                });
              }
            });
            $('thead th.searchable', table).not('.select').each(function(i, th) {
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
            $('thead th.searchable.select', table).each(function(i, th) {
              var index = $('thead th', table).index(th);
              var title = $(th).text();
              var select = $('<select>');
              var option = $('<option>').text(Aldu.t('Filter') + ' ' + title);
              select.append(option);
              var aData = tagsTable.fnGetColumnData(index, true, true, true, true);
              for (var i = 0; i < aData.length; i++) {
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
          else if ($(table).hasClass('aldu-core-view-tagged')){
            $('tbody', table).sortable({
              update : function(event, ui) {
                $('tr input[name*="[weight]"]', event.target).each(function() {
                  var tr = $(this).closest('tr');
                  var weight = tr.index();
                  $(this).val(weight);
                });
              }
            });
          }
        });
      }
    },
    Form : {
      init : function(context) {
        $('form', context).autoload('jquery.tools', function(i, form) {
          Aldu.log('Aldu.UI.Form.init', 2);
          $.tools.validator.fn('[data-equals]', Aldu.t("Value not equal with the $1 field."), function(input) {
            var id = input.data('equals');
            var field = $('#' + id);
            var name = field.siblings('label').text();
            var valid = input.val() == field.val();
            return valid ? true : [name];
          });
          $(form).validator({
            messageClass : 'validation-bubble',
            position : 'bottom left',
            offset: [ 12, 0 ],
            message : '<div class="ui-state-error"><em class="ui-state-error"></em><span class="ui-icon ui-icon-alert"></span></div>'
          });
          $('textarea[data-mode]', context).autoload('codemirror', {
            modes : [ 'php' ],
            themes : [ 'eclipse', 'night', 'cobalt', 'monokai' ]
          }, function(i, textarea) {
            $(textarea).codemirror({
              mode : $(textarea).data('mode'),
              lineNumbers : true,
              readOnly : $(textarea).prop('readonly'),
              theme : 'monokai'
            });
          });
          $('input:submit', context).on('click', function(event) {
            if (!event.target.form) {
              var id = $(event.target).attr('form');
              $('form#' + id).submit();
            }
          });
          if (!form.elements.length) {
            var id = form.id;
            $(form).on('submit', function(event) {
              event.preventDefault();
              $(':input[form=' + id + ']', context).each(function(i, input) {
                $(input).trigger('update.aldu');
                var ck = $(input).data('ckeditorInstance');
                if (ck) {
                  ck.updateElement();
                }
                var hidden = $('<input>').attr({
                  type : 'hidden',
                  name : $(input).attr('name'),
                  value : $(input).val()
                });
                $(form).append(hidden);
              });
              form.submit();
            });
          }
        });
      }
    },
    Panel : {
      init : function(context) {
        Aldu.ready(function() {
          $('.aldu-helpers-panel').each(function(i, panel) {
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
              var shortcuts = $('.aldu-ui-toolbar-shortcuts');
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
    },
    init : function(context) {
      Aldu.UI.Form.init(context);
      Aldu.UI.Table.init(context);
      Aldu.UI.Panel.init(context);
    }
  }
});
