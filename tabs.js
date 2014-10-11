
/**
 * @ngdoc overview
 * @name bigcheap.sortabletabs
 *
 * @description
 * AngularJS version of the tabs directive.
 * @see https://github.com/angular-ui/bootstrap
 */

angular.module('bigcheap', ['bigcheap.tpls', 'bigcheap.sortabletabs']);
angular.module("bigcheap.tpls", ['bigcheap/tabs/tab.html', 'bigcheap/tabs/tabset-titles.html', 'bigcheap/tabs/tabset.html']);

angular.module('bigcheap.sortabletabs', [])

.controller('SortableTabsetController', ['$scope', function TabsetCtrl($scope) {
  var ctrl = this,
      tabs = ctrl.tabs = $scope.tabs = [];

  ctrl.select = function(selectedTab) {
    angular.forEach(tabs, function(tab) {
      if (tab.active && tab !== selectedTab) {
        tab.active = false;
        tab.onDeselect();
      }
    });
    selectedTab.active = true;
    selectedTab.onSelect();
  };

  ctrl.addTab = function addTab(tab) {
    tabs.push(tab);
    // we can't run the select function on the first tab
    // since that would select it twice
    if (tabs.length === 1) {
      tab.active = true;
    } else if (tab.active) {
      ctrl.select(tab);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index = tabs.indexOf(tab);
    //Select a new tab if the tab to be removed is selected and not destroyed
    if (tab.active && tabs.length > 1 && !destroyed) {
      //If this is the last tab, select the previous tab. else, the next tab.
      var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
      ctrl.select(tabs[newActiveIndex]);
    }
    tabs.splice(index, 1);
  };

  var destroyed;
  $scope.$on('$destroy', function() {
    destroyed = true;
  });
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabset
 * @restrict EA
 *
 * @description
 * Tabset is the outer container for the tabs directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the tabs.
 * @param {boolean=} justified Whether or not to use justified styling for the tabs.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab heading="Tab 1"><b>First</b> Content!</tab>
      <tab heading="Tab 2"><i>Second</i> Content!</tab>
    </tabset>
    <hr />
    <tabset vertical="true">
      <tab heading="Vertical Tab 1"><b>First</b> Vertical Content!</tab>
      <tab heading="Vertical Tab 2"><i>Second</i> Vertical Content!</tab>
    </tabset>
    <tabset justified="true">
      <tab heading="Justified Tab 1"><b>First</b> Justified Content!</tab>
      <tab heading="Justified Tab 2"><i>Second</i> Justified Content!</tab>
    </tabset>
  </file>
</example>
 */
.directive('sortableTabset', function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    scope: {
      type: '@'
    },
    controller: 'SortableTabsetController',
    templateUrl: 'bigcheap/tabs/tabset.html',
    link: function(scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
    }
  };
})

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tab
 * @restrict EA
 *
 * @param {string=} heading The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 * @param {string=} select An expression to evaluate when the tab is selected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 *
 * @description
 * Creates a tab with a heading and content. Must be placed within a {@link ui.bootstrap.tabs.directive:tabset tabset}.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <div ng-controller="TabsDemoCtrl">
      <button class="btn btn-small" ng-click="items[0].active = true">
        Select item 1, using active binding
      </button>
      <button class="btn btn-small" ng-click="items[1].disabled = !items[1].disabled">
        Enable/disable item 2, using disabled binding
      </button>
      <br />
      <tabset>
        <tab heading="Tab 1">First Tab</tab>
        <tab select="alertMe()">
          <tab-heading><i class="icon-bell"></i> Alert me!</tab-heading>
          Second Tab, with alert callback and html heading!
        </tab>
        <tab ng-repeat="item in items"
          heading="{{item.title}}"
          disabled="item.disabled"
          active="item.active">
          {{item.content}}
        </tab>
      </tabset>
    </div>
  </file>
  <file name="script.js">
    function TabsDemoCtrl($scope) {
      $scope.items = [
        { title:"Dynamic Title 1", content:"Dynamic Item 0" },
        { title:"Dynamic Title 2", content:"Dynamic Item 1", disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert("You've selected the alert tab!");
        });
      };
    };
  </file>
</example>
 */

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabHeading
 * @restrict EA
 *
 * @description
 * Creates an HTML heading for a {@link ui.bootstrap.tabs.directive:tab tab}. Must be placed as a child of a tab element.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab>
        <tab-heading><b>HTML</b> in my titles?!</tab-heading>
        And some content, too!
      </tab>
      <tab>
        <tab-heading><i class="icon-heart"></i> Icon heading?!?</tab-heading>
        That's right.
      </tab>
    </tabset>
  </file>
</example>

@see http://stackoverflow.com/questions/22850782/angular-tabs-sortable-moveable
 */
.directive('sortableTab', ['$parse', '$window', function($parse, $window) {
  return {
    require: '^sortableTabset',
    restrict: 'EA',
    replace: true,
    templateUrl: 'bigcheap/tabs/tab.html',
    transclude: true,
    scope: {
      active: '=?',
      heading: '@',
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                          //once it inserts the tab's content into the dom
      onDeselect: '&deselect',
      onDragend: '&dragend'
    },
    controller: function() {
      //Empty controller so other directives can require being 'under' a tab
    },
    compile: function(elm, attrs, transclude) {
      return function postLink(scope, elm, attrs, tabsetCtrl) {
        if (!attrs.ngRepeat) {
          throw 'sortable tab need to be used under ng-repeat directive';
        }
        scope.$watch('active', function(active) {
          if (active) {
            tabsetCtrl.select(scope);
          }
        });

        scope.disabled = false;
        if ( attrs.disabled ) {
          scope.$parent.$watch($parse(attrs.disabled), function(value) {
            scope.disabled = !! value;
          });
        }

        scope.select = function() {
          if ( !scope.disabled ) {
            scope.active = true;
          }
        };

        tabsetCtrl.addTab(scope);
        scope.$on('$destroy', function() {
          tabsetCtrl.removeTab(scope);
        });

        //We need to transclude later, once the content container is ready.
        //when this link happens, we're inside a tab heading.
        scope.$transcludeFn = transclude;

        //
        // add draggable functionality to the ng-repeat
        //
        var match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
        var tabsGetter = $parse('$parent.'+match[2]);
        console.log('new random number generated.');
        var dragTag = Math.random().toString();

        attrs.$set('draggable', true);
        if (!attrs.sortableTabCategory) {
          throw 'sortable-tab should have a UNIQUE sortable-tab-category value to distinguish it from the others'
        }
        var tabCategory = attrs.sortableTabCategory.toString()

        var internalMethods = {
          getDropAreaFound: function (tag) {
            if (tag) {
              var item = angular.fromJson($window.sessionStorage.getItem(tag));
              if (item && item.dropareafound) {
                return !!item.dropareafound;
              }
            }
            return false;
          },
          toggleDropAreaFound: function (tag) {
            if (tag) {
              var item = angular.fromJson($window.sessionStorage.getItem(tag));
              if (item) {
                item.dropareafound = ! item.dropareafound;
                $window.sessionStorage.setItem(tag, angular.toJson(item));
              }
            }
          }
        };

        var listeners = {
          dragstart: function (event) {
            elm.addClass('dragging');
            event = event.originalEvent ? event.originalEvent : event;
            var dt = event.dataTransfer;
            dt.effectAllowed = 'move';
            dt.dropEffect = 'move';
            dt.setData('bigcheap/tab-index', scope.$parent.$index);
            dt.setData('bigcheap/tab-category', tabCategory);
            dt.setData('bigcheap/tab-json', angular.toJson(scope.$parent[match[1]]));
            dt.setData('bigcheap/tab-drag-tag', dragTag);
            $window.sessionStorage.setItem(dragTag
              , angular.toJson({dropareafound: false}));
          },
          drag: function (event) {
          },
          dragend: function (event) {
            elm.removeClass('dragging');

            var found = internalMethods.getDropAreaFound(dragTag);
            console.log('dragend dragTag: ', dragTag, ' found: ', found);

            if (found) {
              scope.$apply(function () {
                tabsGetter(scope).splice(scope.$parent.$index, 1);
              });
            };

            scope.onDragend({dropAreaFound: found});
          },
          dragenter: function (event) {
            console.log('dragenter ...');
            elm.addClass('dragover');

            event = event.originalEvent ? event.originalEvent : event;
            var dt = event.dataTransfer;
            internalMethods.toggleDropAreaFound(dt.getData('bigcheap/tab-drag-tag'), true);
          },
          dragleave: function (event) {
            console.log('dragleave ...');
            elm.removeClass('dragover');
            elm.removeClass('tab-insert-left');
            elm.removeClass('tab-insert-right');

            event = event.originalEvent ? event.originalEvent : event;
            var dt = event.dataTransfer;
            internalMethods.toggleDropAreaFound(dt.getData('bigcheap/tab-drag-tag'), false);
          },
          dragover: function (event) {
            event.preventDefault();
            event = event.originalEvent ? event.originalEvent : event;

            var midLine = elm.offset().left + elm.width() / 2;
            if(event.x < midLine) {
              elm.addClass('tab-insert-left');
              elm.removeClass('tab-insert-right');
            } else {
              elm.addClass('tab-insert-right');
              elm.removeClass('tab-insert-left');
            }
          },
          drop: function (event) {
            elm.removeClass('dragover');
            elm.removeClass('tab-insert-left');
            elm.removeClass('tab-insert-right');

            event = event.originalEvent ? event.originalEvent : event;
            var dt = event.dataTransfer;
            var sourceIndex = dt.getData('bigcheap/tab-index');
            var midLine = elm.offset().left + elm.width() / 2;
            var insertIndex = event.x < midLine ? scope.$parent.$index : scope.$parent.$index + 1;

            if (tabCategory === dt.getData('bigcheap/tab-category')) {
              scope.$apply(function () {
                console.log('before splice drop insertIndex:', insertIndex);
                tabsGetter(scope).splice(insertIndex, 0, angular.fromJson(dt.getData('bigcheap/tab-json')));
                console.log('after splice drop insertIndex:', insertIndex);
              });
            }
          },
          mouseenter: function (event) {
            elm.addClass('hover');
          },
          mouseleave: function (event) {
            elm.removeClass('hover');
          }
        };

        angular.forEach(listeners, function (listener, event) {
          elm.on(event, listener);
        });

      };
    }
  };
}])

.directive('sortableTabHeadingTransclude', [function() {
  return {
    restrict: 'A',
    require: '^sortableTab',
    link: function(scope, elm, attrs, tabCtrl) {
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}])

.directive('sortableTabContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^sortableTabset',
    link: function(scope, elm, attrs) {
      var tab = scope.$eval(attrs.sortableTabContentTransclude);

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      tab.$transcludeFn(tab.$parent, function(contents) {
        angular.forEach(contents, function(node) {
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };
  function isTabHeading(node) {
    return node.tagName &&  (
      node.hasAttribute('tab-heading') ||
      node.hasAttribute('data-tab-heading') ||
      node.tagName.toLowerCase() === 'tab-heading' ||
      node.tagName.toLowerCase() === 'data-tab-heading'
    );
  }
});

angular.module("bigcheap/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("bigcheap/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a ng-click=\"select()\" sortable-tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("bigcheap/tabs/tabset-titles.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("bigcheap/tabs/tabset-titles.html",
    "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
    "</ul>\n" +
    "");
}]);

angular.module("bigcheap/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("bigcheap/tabs/tabset.html",
    "\n" +
    "<div>\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         sortable-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);
