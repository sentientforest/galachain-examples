use bevy::prelude::*;
use bip39::Mnemonic;
use secp256k1::{SecretKey, PublicKey};
use rand::rngs::OsRng;
use sha3::{Digest, Keccak256};

// Components
#[derive(Component)]
struct WalletButton;

#[derive(Component)]
struct ImportButton;

#[derive(Resource)]
struct WalletState {
    address: Option<String>,
    private_key: Option<SecretKey>,
    mnemonic: Option<String>,
}

const NORMAL_BUTTON: Color = Color::srgb(0.15, 0.15, 0.15);
const HOVERED_BUTTON: Color = Color::srgb(0.25, 0.25, 0.25);
const PRESSED_BUTTON: Color = Color::srgb(0.35, 0.75, 0.35);

fn setup_ui(mut commands: Commands) {
    // UI Camera
    commands.spawn(Camera2d);

    // Root node
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                ..default()
            },
            BackgroundColor(Color::srgb(0.1, 0.1, 0.1)),
        ))
        .with_children(|parent| {
            // Generate Wallet Button
            parent
                .spawn((
                    Button,
                    WalletButton,
                    Node {
                        width: Val::Px(200.0),
                        height: Val::Px(50.0),
                        border: UiRect::all(Val::Px(2.0)),
                        justify_content: JustifyContent::Center,
                        align_items: AlignItems::Center,
                        ..default()
                    },
                    BorderColor(Color::BLACK),
                    BorderRadius::new(Val::Px(5.0), Val::Px(5.0), Val::Px(5.0), Val::Px(5.0)),
                    BackgroundColor(NORMAL_BUTTON),
                ))
                .with_child((
                    Text::new("Generate Wallet"),
                ));

            // Import Wallet Button
            parent
                .spawn((
                    Button,
                    ImportButton,
                    Node {
                        width: Val::Px(200.0),
                        height: Val::Px(50.0),
                        border: UiRect::all(Val::Px(2.0)),
                        justify_content: JustifyContent::Center,
                        align_items: AlignItems::Center,
                        margin: UiRect::all(Val::Px(10.0)),
                        ..default()
                    },
                    BorderColor(Color::BLACK),
                    BorderRadius::new(Val::Px(5.0), Val::Px(5.0), Val::Px(5.0), Val::Px(5.0)),
                    BackgroundColor(NORMAL_BUTTON),
                ))
                .with_child((
                    Text::new("Import Wallet"),
                ));
        });
}

fn generate_wallet() -> (SecretKey, String, String) {
    let mut rng = OsRng;
    
    // Generate mnemonic
    let entropy = rand::random::<[u8; 16]>();
    let mnemonic = Mnemonic::from_entropy(&entropy).expect("Failed to generate mnemonic");
    
    // Generate private key
    let private_key = SecretKey::new(&mut rng);
    
    // Generate public key and address
    let public_key = PublicKey::from_secret_key(&secp256k1::Secp256k1::new(), &private_key);
    let public_key_bytes = public_key.serialize_uncompressed();
    
    // Generate Ethereum address (last 20 bytes of keccak256 of public key)
    let mut hasher = Keccak256::new();
    hasher.update(&public_key_bytes[1..]); // Skip recovery id byte
    let result = hasher.finalize();
    let address = format!("0x{}", hex::encode(&result[12..])); // Take last 20 bytes
    
    (private_key, address, mnemonic.to_string())
}

fn wallet_button_system(
    mut interaction_query: Query<
        (&Interaction, &mut BackgroundColor, &mut BorderColor),
        (Changed<Interaction>, With<WalletButton>),
    >,
    mut wallet_state: ResMut<WalletState>,
) {
    for (interaction, mut color, mut border_color) in &mut interaction_query {
        match *interaction {
            Interaction::Pressed => {
                let (secret_key, address, mnemonic) = generate_wallet();
                wallet_state.private_key = Some(secret_key);
                wallet_state.address = Some(address);
                wallet_state.mnemonic = Some(mnemonic);
                *color = PRESSED_BUTTON.into();
                border_color.0 = Color::srgb(1.0, 0.0, 0.0);
            }
            Interaction::Hovered => {
                *color = HOVERED_BUTTON.into();
                border_color.0 = Color::WHITE;
            }
            Interaction::None => {
                *color = NORMAL_BUTTON.into();
                border_color.0 = Color::BLACK;
            }
        }
    }
}

fn import_button_system(
    mut interaction_query: Query<
        (&Interaction, &mut BackgroundColor, &mut BorderColor),
        (Changed<Interaction>, With<ImportButton>),
    >,
) {
    for (interaction, mut color, mut border_color) in &mut interaction_query {
        match *interaction {
            Interaction::Pressed => {
                *color = PRESSED_BUTTON.into();
                border_color.0 = Color::srgb(1.0, 0.0, 0.0);
            }
            Interaction::Hovered => {
                *color = HOVERED_BUTTON.into();
                border_color.0 = Color::WHITE;
            }
            Interaction::None => {
                *color = NORMAL_BUTTON.into();
                border_color.0 = Color::BLACK;
            }
        }
    }
}

pub struct WalletPlugin;

impl Plugin for WalletPlugin {
    fn build(&self, app: &mut App) {
        app.insert_resource(WalletState {
            address: None,
            private_key: None,
            mnemonic: None,
        })
        .add_systems(Startup, setup_ui)
        .add_systems(Update, (wallet_button_system, import_button_system));
    }
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(WalletPlugin)
        .run();
}
