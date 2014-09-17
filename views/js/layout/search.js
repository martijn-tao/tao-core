define([
    'jquery',
    'lodash',
    'i18n',
    'context'
],
    function(
        $,
        _,
        __,
        context
        ){


        /**
         * Retrieve instance of the container element
         *
         * @returns {*}
         */
        function getContainer(type) {
            return  $('.search-form > [data-purpose="' + type + '"]');
        }


        /**
         * Load and beautify search form
         *
         * @param $searchForm
         */
        function initSearch($searchForm) {

            // build jquery obj, make ids unique
            $searchForm = $($searchForm.replace(/(for|id)=("|')/g, '$1=$2search_field_'));

            if(!$searchForm.length) {
                return;
            }

            var $toolBars      = $searchForm.find('.form-toolbar'),
                $formGroups    = $searchForm.find('.form-group'),
                $filters       = $formGroups.last(),
                $langSelector  = $searchForm.find('[name="lang"]'),
                $formContainer = $searchForm.find('.xhtml_form'),
                $formTitle     = $searchForm.find('h2');


            // remove unwanted classes
            $formContainer.parent().removeClass(function(idx, className) {
                return className;
            });

            // remove first toolbar
            if($toolBars.length > 1) {
                $toolBars.first().remove();
            }


            // remove 'options', 'filters' and headings
            $searchForm.find('del').remove();
            $formTitle.remove();


            // select current locale
            $langSelector.val(context.locale);

            // add regular placeholder
            $filters.find('input[type="text"]').each(function() {
                var $parentDiv;
                if((/schema_[\d]+_label$/).test(this.name)) {
                    this.placeholder = __('You can use * as a wildcard');
                    $parentDiv = $(this).closest('div');
                    // remove 'original filename when empty
                    if(!$.trim($parentDiv.next().find('span').last().html())) {
                        $parentDiv.next().remove();
                    }
                    $parentDiv.prependTo($searchForm.find('.form-group:first > div'));
                }
            });


            getContainer('search').html($searchForm);
            toggle();
        }


        function toggle() {
            $('.search-form').slideToggle();
        }

        /**
         * Initialize the filter form : make a click on the button to filter the tree
         * @private
         * @fires layout/tree#refresh.taotree
         */
        function initFiltering(){
            var $container  = getContainer('filter');
            var $field      = $(':text', $container);
            
            var filterHandler = _.debounce(function filterHandler(){
                    //ask the tree to refresh 
                $('.tree').trigger('refresh.taotree', [{ 
                    filter : $field.val() || '*'
                }]);
            }, 100);

            $('button', $container).on('click', filterHandler);
            $field.on('keypress', function(e){
                if(this.value.length > 3 || e.which === 13) {
                    e.preventDefault();
                    filterHandler();
                }
            });
        }

        /**
         * Reset the filtering form
         * @private
         * @fires layout/tree#refresh.taotree
         */
        function resetFiltering(){
            var $container  = getContainer('filter');
            var $field      = $(':text', $container);

            //empty the field
            $field.val('');

            //reset the trees 
            $('.tree').trigger('refresh.taotree', [{ filter : '*' }]);
        }

        return {
            /**
             * Initialize post renderer
             */
            init : function init($searchForm){
                initSearch($searchForm);
                _.delay(function(){
                    initFiltering(); 
                }, 10);
            },

            /**
             * show/hide search form
             */
            toggle : function toggle(){
                var $searchForm = $('.search-form');
                if($searchForm.is(':visible')){
                    resetFiltering();
                }
                $searchForm.slideToggle();
            },

            // access to container
            getContainer: getContainer
        };
    });


