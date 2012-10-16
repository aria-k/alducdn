Aldu.extend({
  UI : {
    Table : {
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
    },
    Form : {
      validator : function(element) {
        $(element).autoload(
          'jquery.tools',
          function(i, element) {
            $(element).validator(
              {
                //onBeforeFail : function(event, el) {},
                messageClass : 'validation-bubble',
                position : 'bottom left',
                offset : [ 12, 0 ],
                message : '<div class="ui-state-error">'
                  + '<em class="ui-state-error"></em>'
                  + '<span class="ui-icon ui-icon-alert"></span></div>'
              });
          });
      },
      init : function(context) {
        Aldu.UI.Form.combobox();
        $('form', context).autoload(
          'jquery.tools',
          function(i, form) {
            Aldu.log('Aldu.UI.Form.init', 2);
            if (!form.elements.length) {
              var container = $(form).parent();
              $('div.aldu-helpers-html-form', container).remove();
              $(form).siblings().appendTo(form);
            }
            $.tools.validator.fn('[data-equals]', Aldu
              .t("Value not equal with the $1 field."), function(input) {
              var id = input.data('equals');
              var field = $('#' + id);
              var name = field.siblings('label').text();
              var valid = input.val() == field.val();
              return valid ? true : [ name ];
            });
            Aldu.UI.Form.validator(form);
            $(form.elements).filter('input[name*="Term"]').each(
              function(i, input) {
                $(input).on(
                  'keydown.ui.aldu',
                  function(event) {
                    if (event.keyCode === $.ui.keyCode.TAB
                      && $(this).data('autocomplete').menu.active) {
                      event.preventDefault();
                    }
                    if (event.keyCode === $.ui.keyCode.ENTER) {
                      var terms = this.value.split(/,\s*/);
                      var names = $.map(terms, function(title) {
                        return title.toLowerCase().replace(/\s+/g, '-');
                      });
                    }
                  }).autocomplete(
                  {
                    search : function() {
                      var terms = this.value.split(/,\s*/).pop();
                      if (terms.length < 2)
                        return false;
                    },
                    select : function(event, ui) {
                      var terms = this.value.split(/,\s*/);
                      terms.pop();
                      if (ui.item.value === terms[terms.length - 1])
                        return false;
                      terms.push(ui.item.value);
                      terms.push('');
                      this.value = terms.join(', ');
                      return false;
                    },
                    focus : function(event, ui) {
                      var terms = this.value.split(/,\s*/);
                      terms.pop();
                      terms.push(ui.item.value);
                      terms.push('');
                      this.value = terms.join(', ');
                      return false;
                    },
                    source : function(req, add) {
                      $.ajax({
                        url : '/aldu/core/terms/ajax',
                        data : {
                          search : [ [ 'title', 'like',
                            '%' + req.term.split(/,\s*/).pop() + '%' ] ]
                        },
                        success : function(data) {
                          add($.map(data, function(item) {
                            return {
                              id : item.id,
                              name : item.name,
                              value : item.title
                            };
                          }));
                        }
                      });
                    },
                    minLength : 2
                  });
              });
            $(form.elements).filter('textarea[data-mode]').autoload(
              'codemirror', {
                modes : [ 'php' ],
                themes : [ 'eclipse', 'night', 'cobalt', 'monokai' ]
              }, function(i, textarea) {
                $(textarea).codemirror({
                  mode : $(textarea).data('mode'),
                  lineNumbers : true,
                  lineWrapping : true,
                  readOnly : $(textarea).prop('readonly'),
                  theme : 'monokai'
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
                $('.aldu-helpers-html-form-element', legend).click(function(e) {
                  e.stopPropagation();
                });
                $(':checkbox, :radio', legend).change(
                  function(e) {
                    if ($(this).is(':not(:checked)')) {
                      $(this).closest('fieldset').find(':checkbox').prop(
                        'checked', false);
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
        $('input[type=date]', context).each(
          function(i, date) {
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
                clone.datepicker('setDate', new Date(this.value.replace(/ /,
                  'T')));
              }
            }
          });
      },
      combobox : function() {
        if (!$.ui.combobox) {
          $.widget("ui.combobox", {
            _create : function() {
              var input, self = this, select = this.element.hide();
              var selected = select.children(":selected"), value = selected
                .val() ? selected.text() : "", wrapper = this.wrapper = $(
                "<span>").addClass("ui-combobox").insertAfter(select);
              var required = this.element.prop('required');
              this.element.prop('required', false);
              input = $("<input>").prop('required', required).attr({
                form : this.element.attr('form')
              });
              input.appendTo(wrapper).val(value).addClass("ui-combobox-input")
                .autocomplete(
                  {
                    delay : 0,
                    minLength : 0,
                    source : function(request, response) {
                      // TODO da rivedere
                      if (source = select.data('source')) {
                        $.ajax({
                          url : source + ':json',
                          data : {
                            flat : true,
                            unique : true,
                            attributes : [ select.data('name') ],
                            search : [ [ select.data('name'), 'like',
                              '%' + request.term + '%' ] ]
                          },
                          success : function(data) {
                            response(data);
                          }
                        });
                      }
                      else {
                        var matcher = new RegExp($.ui.autocomplete
                          .escapeRegex(request.term), "i");
                        response(select.children("option").map(
                          function() {
                            var text = $(this).text();
                            if (this.value
                              && (!request.term || matcher.test(text)))
                              return {
                                label : text.replace(new RegExp(
                                  "(?![^&;]+;)(?!<[^<>]*)("
                                    + $.ui.autocomplete
                                      .escapeRegex(request.term)
                                    + ")(?![^<>]*>)(?![^&;]+;)", "gi"),
                                  "<strong>$1</strong>"),
                                value : text,
                                option : this
                              };
                          }));
                      }
                    },
                    select : function(event, ui) {
                      ui.item.option.selected = true;
                      self._trigger("selected", event, {
                        item : ui.item.option
                      });
                      select.trigger('change');
                    },
                    change : function(event, ui) {
                      if (!ui.item) {
                        var matcher = new RegExp("^"
                          + $.ui.autocomplete.escapeRegex($(this).val()) + "$",
                          "i");
                        var valid = false;
                        select.children("option").each(function() {
                          if ($(this).text().match(matcher)) {
                            this.selected = valid = true;
                            return false;
                          }
                        });
                        if (!valid) {
                          // TODO if invalid, add to the
                          // database or
                          if (url = select.data('add')) {
                            var text = $(this).val();
                            var add = $('<option>');
                            add.prop('selected', true);
                            add.attr({
                              value : text
                            }).text(text).appendTo(select);
                          }
                          // remove invalid value, as it
                          // didn't match
                          // anything
                          else {
                            $(this).val("");
                            select.val("");
                            input.data("autocomplete").term = "";
                          }
                          return false;
                        }
                      }
                    }
                  }).addClass("ui-widget ui-widget-content ui-corner-left");
              Aldu.UI.Form.validator(input);
              input.data("autocomplete")._renderItem = function(ul, item) {
                return $("<li></li>").data("item.autocomplete", item).append(
                  "<a>" + item.label + "</a>").appendTo(ul);
              };
              $("<a>").attr("tabIndex", -1).attr("title", "Show All Items")
                .appendTo(wrapper).button({
                  icons : {
                    primary : "ui-icon-triangle-1-s"
                  },
                  text : false
                }).removeClass("ui-corner-all").addClass(
                  "ui-corner-right ui-combobox-toggle").click(function() {
                  // close if already visible
                  if (input.autocomplete("widget").is(":visible")) {
                    input.autocomplete("close");
                    return;
                  }
                  // work around a bug (likely same cause as
                  // #5265)
                  $(this).blur();
                  // pass empty string as value to search for,
                  // displaying
                  // all
                  // results
                  input.autocomplete("search", "");
                  input.focus();
                });
            },
            destroy : function() {
              this.wrapper.remove();
              this.element.show();
              $.Widget.prototype.destroy.call(this);
            }
          });
        }
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
      Aldu.UI.processHtml(context);
    }
  }
});
