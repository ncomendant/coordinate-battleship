declare var $;

export class UiManager {
    private $ui:any;
    private $uiForm:any;
    private $uiText:any;
    private $uiInp:any;

    private active:boolean;
    private callback:any;

    public constructor() {
        this.$ui = $("#ui");
        this.$uiForm = $("#uiForm");
        this.$uiText = $("#uiText");
        this.$uiInp = $("#uiInp");

        this.active = false;
        this.callback = null;

        this.$uiForm.on("submit", () => {
            if (this.active) {
                let callback:any = this.callback;
                this.close();
                if (callback != null) callback();
                return false;
            }
        });

        $(document).keypress((e) => {
            if (this.active && e.which === 13) {
                e.preventDefault();
                this.$uiForm.submit();
                return false;
            }
        });
    }

    public close():void {
        if (this.active) {
            this.$ui.hide();
            this.callback = null;
            this.active = false;
        }
    }

    public prompt(message:string, inpText:string, callback:(text:string) => void):void {
        if (inpText == null) inpText = '';
        this.$uiInp.val(inpText);
        this.$uiInp.show();

        this.callback =  () => {
            let text:string = this.$uiInp.val().trim();
            callback(text);
        };

        this.showUi(message);
    }

    public alert(message:string, callback:() => void = null):void {
        this.$uiInp.hide();
        this.callback =  callback;
        this.showUi(message);
    }

    private showUi(message:string):void {
        this.active = true;
        this.$uiForm.hide();
        this.$uiText.html(message);
        this.$ui.show();
        this.$uiForm.fadeIn(500, () => {
            this.$uiInp.focus();
        });
    }
}