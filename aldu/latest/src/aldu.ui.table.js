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
