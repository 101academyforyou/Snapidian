import UIKit
import Capacitor

/// Registers the app's own native plugin with Capacitor.
class SnapidianViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SnapidianNativePlugin())
    }
}
