import * as React from 'react';
import styles from './ControleDeFerias.module.scss';
import type { IControleDeFeriasProps } from './IControleDeFeriasProps';
import MapaDeFerias from './MapaDeFerias';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class ControleDeFerias extends React.Component<IControleDeFeriasProps> {
  private _sp: SPFI;

  constructor(props: IControleDeFeriasProps) {
    super(props);
    this._sp = spfi().using(SPFx(this.props.context));
  }

  public render(): React.ReactElement<IControleDeFeriasProps> {
    return (
      <div className={styles.app}>
        <MapaDeFerias sp={this._sp} />
      </div>
    );
  }
}