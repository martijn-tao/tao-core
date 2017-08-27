<div class="ui-generis-widget combo-search-box">
    {{#if label}}
    <div class="left">
        {{> ui-generis-widget-label }}
    </div>
    {{/if}}

    <div class="right {{#unless label}}full{{/unless}}">
        <!-- input -->
        <div class="input">
            <input name="{{uri}}" placeholder="{{placeholder}}" value="" data-value="" readonly="readonly">
            <span class="icon-spinner"></span>
        </div>

        <!-- dropdown -->
        <div class="dropdown">
            <div class="search">
                <input type="text" placeholder="{{__ 'Search options...'}}">
                <span class="icon-find"></span>
            </div>
            <div class="divider"></div>
            <div class="menu">
                <div class="no-results">{{__ 'No results...'}}</div>
                {{#each range}}
                <div class="item" data-value="{{this.uri}}" data-text="{{this.label}}">
                    <span class="icon-radio not-selected"></span>
                    <span class="icon-radio-bg selected"></span>
                    {{this.label}}
                </div>
                {{/each}}
            </div>
        </div>
    </div>

</div>