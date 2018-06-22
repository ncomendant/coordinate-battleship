declare var $;

export class UiManager {
    private $ui:any;
    private $uiForm:any;
    private $uiText:any;
    private $uiInp:any;

    private callback:any;

    private promptMode:boolean;

    public constructor() {
        this.$ui = $("#ui");
        this.$uiForm = $("#uiForm");
        this.$uiText = $("#uiText");
        this.$uiInp = $("#uiInp");

        this.callback = null;
        this.promptMode = true;

        this.$uiForm.on("submit", (event:any) => {
            event.preventDefault();
            if (this.promptMode) {
                let value = this.$uiInp.val().trim();
                this.$ui.hide();
                this.callback(value);
                this.callback = null;
            } else {
                this.$ui.hide();
                if (this.callback !== null) {
                    this.callback();
                    this.callback = null;
                }
            }
        });
    }

    public prompt(message:string, callback:(text:string) => void):void {
        this.showUi(message, callback, true);
    }

    public alert(message:string, callback:() => void = null):void {
        this.showUi(message, callback, false);
    }

    private showUi(message:string, callback:any, showPrompt:boolean):void {
       this.callback = callback;
       this.promptMode = showPrompt;

        this.$uiForm.hide();

        if (showPrompt) {
            this.$uiInp.show();
            this.$uiInp.val('');
        }
        else this.$uiInp.hide();

        this.$uiText.html(message);

        this.$ui.show();
        
        this.$uiForm.fadeIn(500, () => {
            if (showPrompt) this.$uiInp.focus();
            else this.$ui.focus();
        });
    }
}