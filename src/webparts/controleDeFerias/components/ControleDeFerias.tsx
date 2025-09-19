import * as React from 'react';
import type { IControleDeFeriasProps } from './IControleDeFeriasProps';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { ModernVacationTimeline } from './ModernVacationTimeline/ModernVacationTimeline';

const ControleDeFeriasComponent: React.FunctionComponent<{ sp: SPFI }> = (props) => {
  return (
    <div style={{ margin: '0', padding: '24px', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <ModernVacationTimeline
        sp={props.sp}
        useMockData={false}
        anoInicial={new Date().getFullYear()}
        mesInicial={new Date().getMonth()}
      />
    </div>
  );
};

export default class ControleDeFerias extends React.Component<IControleDeFeriasProps> {
  private _sp: SPFI;

  constructor(props: IControleDeFeriasProps) {
    super(props);
    this._sp = spfi().using(SPFx(this.props.context));
  }

  public render(): React.ReactElement<IControleDeFeriasProps> {
    return (
      <ControleDeFeriasComponent sp={this._sp} />
    );
  }
}